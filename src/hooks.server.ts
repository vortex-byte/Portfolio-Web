import type { Handle } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import { env, assertProductionSecurity } from '$lib/server/env';
import { logger } from '$lib/server/logger';
import { checkRateLimit } from '$lib/server/security/rateLimiter';
import { parseDuration, generateUuid } from '$lib/server/utils';
import { getAccessToken, getRefreshToken } from '$lib/server/security/cookies';
import { authService } from '$lib/server/container';

const SECURITY_HEADERS: Record<string, string> = {
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

function buildCsp(isDev: boolean): string {
	const directives = [
		`default-src 'self'`,
		`script-src 'self'${isDev ? " 'unsafe-inline'" : ''} https://challenges.cloudflare.com`,
		`style-src 'self' 'unsafe-inline'`,
		`img-src 'self' data: blob: https:`,
		`font-src 'self' data:`,
		`connect-src 'self' https://challenges.cloudflare.com`,
		`frame-src 'self' https://challenges.cloudflare.com`,
		`frame-ancestors 'none'`,
		`base-uri 'self'`,
		`form-action 'self'`
	];
	return directives.join('; ');
}

async function resolveUser(event: Parameters<Handle>[0]['event']): Promise<void> {
	const { cookies } = event;
	const accessToken = getAccessToken(cookies);

	if (accessToken) {
		const payload = await authService.verifySession(accessToken);
		if (payload) {
			event.locals.user = { id: payload.sub, email: payload.email, name: payload.name };
			return;
		}
	}

	const refreshToken = getRefreshToken(cookies);
	if (refreshToken) {
		const refreshed = await authService.refreshSession(cookies);
		if (refreshed) {
			const newToken = getAccessToken(cookies);
			if (newToken) {
				const payload = await authService.verifySession(newToken);
				if (payload) {
					event.locals.user = { id: payload.sub, email: payload.email, name: payload.name };
					return;
				}
			}
		}
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	assertProductionSecurity();

	const { url, request, getClientAddress } = event;
	const startTime = Date.now();
	const ip = getClientAddress();

	if (request.method !== 'GET' && request.method !== 'HEAD') {
		const origin = request.headers.get('origin');
		if (origin && origin !== url.origin) {
			throw error(403, 'Cross-origin requests are not allowed');
		}
	}

	if (url.pathname === '/api/contact') {
		const result = await checkRateLimit(
			`ratelimit:contact:${ip}`,
			env.RATE_LIMIT_CONTACT_MAX,
			parseDuration(env.RATE_LIMIT_CONTACT_WINDOW)
		);
		if (!result.allowed) {
			throw error(429, 'Too many requests. Please try again later.');
		}
	}

	if (url.pathname === '/api/admin/auth/login') {
		const result = await checkRateLimit(
			`ratelimit:login:${ip}`,
			env.RATE_LIMIT_LOGIN_MAX,
			parseDuration(env.LOGIN_LOCKOUT_WINDOW)
		);
		if (!result.allowed) {
			throw error(429, 'Too many attempts. Please try again later.');
		}
	}

	await resolveUser(event);

	if (
		url.pathname.startsWith('/admin') &&
		!url.pathname.startsWith('/admin/login') &&
		!url.pathname.startsWith('/api/')
	) {
		if (!event.locals.user) {
			throw redirect(302, '/admin/login');
		}
	}

	if (
		url.pathname.startsWith('/api/admin') &&
		!url.pathname.startsWith('/api/admin/auth')
	) {
		if (!event.locals.user) {
			throw error(401, 'Unauthorized');
		}
	}

	const response = await resolve(event);

	const isDev = env.NODE_ENV === 'development';
	response.headers.set('Content-Security-Policy', buildCsp(isDev));
	for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(key, value);
	}
	if (env.NODE_ENV === 'production') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	const duration = Date.now() - startTime;
	logger.info(
		{ method: request.method, path: url.pathname, ip, duration, status: response.status },
		'Request completed'
	);

	return response;
};

export const handleError = async ({
	error,
	event,
	status,
	message
}: {
	error: unknown;
	event: Parameters<Handle>[0]['event'];
	status: number;
	message: string;
}) => {
	const errorId = generateUuid();
	const err = error as Error;

	logger.error(
		{
			err,
			errorId,
			path: event.url.pathname,
			status,
			message: err?.message ?? message
		},
		'Unhandled error'
	);

	if (env.PUBLIC_DEBUG_MODE) {
		return {
			message: err?.message ?? String(error),
			stack: err?.stack,
			errorId
		};
	}

	return {
		message: 'Something went wrong. Please try again later.',
		errorId
	};
};
