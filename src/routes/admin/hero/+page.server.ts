import { contentService } from '$lib/server/container';
import { heroSchema, sectionHeaderSchema } from '$lib/validation/adminSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [hero, sectionHeader] = await Promise.all([
		contentService.getHero(),
		contentService.getSectionHeader('hero')
	]);
	return { hero, sectionHeader };
};

export const actions: Actions = {
	saveHeader: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			sectionKey: 'hero',
			eyebrow: formData.get('eyebrow')?.toString() || null,
			title: formData.get('title')?.toString() || null,
			description: formData.get('description')?.toString() || null,
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
			title: formData.get('title')?.toString() ?? '',
			description: formData.get('description')?.toString() ?? '',
			ctaPrimaryLabel: formData.get('ctaPrimaryLabel')?.toString() || null,
			ctaPrimaryUrl: formData.get('ctaPrimaryUrl')?.toString() || null,
			ctaSecondaryLabel: formData.get('ctaSecondaryLabel')?.toString() || null,
			ctaSecondaryUrl: formData.get('ctaSecondaryUrl')?.toString() || null,
			showPhoto: formData.get('showPhoto') === 'true' || formData.get('showPhoto') === 'on',
			photoUrl: formData.get('photoUrl')?.toString() || null,
			photoAlt: formData.get('photoAlt')?.toString() || null,
			photoZoom: formData.get('photoZoom') ? Number(formData.get('photoZoom')) : 100
		};

		const result = heroSchema.safeParse(input);
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid hero input' });
		}

		await contentService.saveHero(result.data);
		return { success: true };
	}
};
