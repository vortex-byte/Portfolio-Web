import { storageProvider } from '$lib/server/container';
import { env } from '$lib/server/env';
import { logger } from '$lib/server/logger';
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

		const result = await storageProvider.saveImage(file, category);
		return json(result);
	} catch (err: unknown) {
		const errorObj = err as Error;
		logger.error({ err: errorObj }, 'Image upload failed');
		const isValidationError =
			errorObj.message?.includes('Invalid file type') ||
			errorObj.message?.includes('File too large');

		const errorMessage =
			isValidationError || env.PUBLIC_DEBUG_MODE
				? errorObj.message || 'Image upload failed'
				: 'Image upload failed';

		return json({ error: errorMessage }, { status: isValidationError ? 400 : 500 });
	}
};
