import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isLoginPage = url.pathname === '/admin/login';

	if (!locals.user && !isLoginPage) {
		throw redirect(302, '/admin/login');
	}

	if (locals.user && isLoginPage) {
		throw redirect(302, '/admin');
	}

	return {
		user: locals.user
	};
};
