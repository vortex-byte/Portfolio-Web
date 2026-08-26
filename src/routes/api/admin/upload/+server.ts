import { localStorageProvider } from '$lib/server/container';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const category = formData.get('category')?.toString() || 'general';

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		const result = await localStorageProvider.saveImage(file, category);
		return json(result);
	} catch (err: unknown) {
		const errorObj = err as Error;
		return json({ error: errorObj.message || 'Image upload failed' }, { status: 400 });
	}
};
