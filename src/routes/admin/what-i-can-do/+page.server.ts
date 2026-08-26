import { contentService } from '$lib/server/container';
import { serviceItemSchema, sectionHeaderSchema } from '$lib/validation/adminSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [items, sectionHeader] = await Promise.all([
		contentService.getServices(false),
		contentService.getSectionHeader('services')
	]);
	return { items, sectionHeader };
};

export const actions: Actions = {
	saveHeader: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			sectionKey: 'services',
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
	create: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			title: formData.get('title')?.toString() ?? '',
			description: formData.get('description')?.toString() ?? '',
			icon: formData.get('icon')?.toString() || 'PanelsTopLeft'
		};

		const result = serviceItemSchema.safeParse(input);
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid service card input' });
		}

		await contentService.createService(result.data);
		return { success: true };
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const input = {
			title: formData.get('title')?.toString() ?? '',
			description: formData.get('description')?.toString() ?? '',
			icon: formData.get('icon')?.toString() || 'PanelsTopLeft'
		};

		if (!id) return fail(400, { error: 'ID is required' });

		const result = serviceItemSchema.safeParse(input);
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid service card input' });
		}

		await contentService.updateService({ id, ...result.data });
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID is required' });

		await contentService.deleteService(id);
		return { success: true };
	},

	toggleVisibility: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const isVisible = formData.get('isVisible') === 'true';

		if (!id) return fail(400, { error: 'ID is required' });

		await contentService.toggleServiceVisibility(id, isVisible);
		return { success: true };
	},

	reorder: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const direction = formData.get('direction')?.toString();

		if (!id || (direction !== 'up' && direction !== 'down')) {
			return fail(400, { error: 'Invalid parameters' });
		}

		await contentService.reorderService(id, direction);
		return { success: true };
	}
};
