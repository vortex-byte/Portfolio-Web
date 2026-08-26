import { contentService } from '$lib/server/container';
import { footerSchema } from '$lib/validation/adminSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const footer = await contentService.getFooter();
	return { footer };
};

export const actions: Actions = {
	save: async ({ request }) => {
		const formData = await request.formData();
		const copyrightText = formData.get('copyrightText')?.toString().trim() || null;
		const rawSocialLinks = formData.get('socialLinks')?.toString().trim();

		let socialLinks: unknown = null;
		if (rawSocialLinks) {
			try {
				socialLinks = JSON.parse(rawSocialLinks);
			} catch {
				return fail(400, { error: 'Invalid JSON format for social links' });
			}
		}

		const result = footerSchema.safeParse({ copyrightText, socialLinks });
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid footer input' });
		}

		const data = result.data;
		await contentService.saveFooter({
			copyrightText: data.copyrightText,
			socialLinks: data.socialLinks ?? null
		});

		return { success: true };
	}
};
