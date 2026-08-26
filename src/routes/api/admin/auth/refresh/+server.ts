import { authService } from '$lib/server/container';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const refreshed = await authService.refreshSession(cookies);

	if (!refreshed) {
		return json({ error: 'Invalid or expired refresh token' }, { status: 401 });
	}

	return json({ success: true });
};
