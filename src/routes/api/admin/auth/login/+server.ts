import { authService } from '$lib/server/container';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress, cookies }) => {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const ip = getClientAddress();
		const identifier = `${ip}:${email}`;

		const result = await authService.login(email, password, identifier, cookies);

		if (!result.success) {
			return json({ error: result.error || 'Invalid credentials' }, { status: 400 });
		}

		return json({ success: true });
	} catch {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}
};
