import { authService } from '$lib/server/container';
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
