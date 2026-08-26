import { authService } from '$lib/server/container';
import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	await authService.logout(cookies);

	const acceptHeader = request.headers.get('accept') || '';
	if (acceptHeader.includes('text/html')) {
		throw redirect(302, '/admin/login');
	}

	return json({ success: true });
};
