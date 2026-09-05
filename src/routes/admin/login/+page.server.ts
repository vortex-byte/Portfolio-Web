import { authService } from '$lib/server/container';
import { env } from '$lib/server/env';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin');
	}
	return {};
};

export const actions: Actions = {
	login: async ({ request, getClientAddress, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				values: { email }
			});
		}

		const ip = getClientAddress();

		if (env.NODE_ENV === 'production' && env.TURNSTILE_SECRET_KEY) {
			const turnstileToken = formData.get('cf-turnstile-response')?.toString();
			if (!turnstileToken) {
				return fail(400, {
					error: 'Security challenge validation failed. Please try again.',
					values: { email }
				});
			}

			const verifyRes = await fetch(
				'https://challenges.cloudflare.com/turnstile/v0/siteverify',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams({
						secret: env.TURNSTILE_SECRET_KEY,
						response: turnstileToken,
						remoteip: ip
					})
				}
			);

			const outcome = (await verifyRes.json()) as { success?: boolean };
			if (!outcome.success) {
				return fail(400, {
					error: 'Security challenge failed. Please refresh and try again.',
					values: { email }
				});
			}
		}

		const identifier = `${ip}:${email}`;

		const result = await authService.login(email, password, identifier, cookies);

		if (!result.success) {
			return fail(400, {
				error: result.error || 'Invalid credentials',
				values: { email }
			});
		}

		throw redirect(302, '/admin');
	}
};
