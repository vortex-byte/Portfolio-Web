import { contentService } from '$lib/server/container';
import { sanitizeHtml } from '$lib/server/security/sanitizer';
import { aboutSchema, sectionHeaderSchema } from '$lib/validation/adminSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [about, sectionHeader] = await Promise.all([
		contentService.getAbout(),
		contentService.getSectionHeader('about')
	]);
	return { about, sectionHeader };
};

export const actions: Actions = {
	saveHeader: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			sectionKey: 'about',
			eyebrow: formData.get('eyebrow')?.toString() || null,
			title: formData.get('title')?.toString() || null,
			isVisible: formData.get('isVisible') === 'true' || formData.get('isVisible') === 'on'
		};

		const result = sectionHeaderSchema.safeParse(input);
		if (!result.success) {
			return fail(400, { error: 'Invalid section header input' });
		}

		await contentService.saveSectionHeader(result.data);
		return { headerSuccess: true };
	},

	save: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			content: formData.get('content')?.toString() ?? '',
			imagePath: formData.get('imagePath')?.toString() || null,
			imageAlt: formData.get('imageAlt')?.toString() || null
		};

		const result = aboutSchema.safeParse(input);
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid about input' });
		}

		const data = result.data;
		const cleanContent = sanitizeHtml(data.content);

		await contentService.saveAbout({
			content: cleanContent,
			imagePath: data.imagePath,
			imageAlt: data.imageAlt
		});

		return { success: true };
	}
};
