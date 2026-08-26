import type { Cookies } from '@sveltejs/kit';
import { env } from '$lib/server/env';
import { parseDuration } from '$lib/server/utils';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const cookieOptions = {
	httpOnly: true,
	secure: env.NODE_ENV === 'production',
	sameSite: 'strict' as const,
	path: '/'
};

export function setAuthCookies(cookies: Cookies, accessToken: string, refreshToken: string): void {
	cookies.set(ACCESS_COOKIE, accessToken, {
		...cookieOptions,
		maxAge: parseDuration(env.JWT_ACCESS_EXPIRES_IN)
	});
	cookies.set(REFRESH_COOKIE, refreshToken, {
		...cookieOptions,
		maxAge: parseDuration(env.JWT_REFRESH_EXPIRES_IN)
	});
}

export function clearAuthCookies(cookies: Cookies): void {
	cookies.delete(ACCESS_COOKIE, { path: '/' });
	cookies.delete(REFRESH_COOKIE, { path: '/' });
}

export function getAccessToken(cookies: Cookies): string | undefined {
	return cookies.get(ACCESS_COOKIE);
}

export function getRefreshToken(cookies: Cookies): string | undefined {
	return cookies.get(REFRESH_COOKIE);
}
