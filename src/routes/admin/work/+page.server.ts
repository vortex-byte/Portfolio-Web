import { workService, contentService } from '$lib/server/container';
import { sectionHeaderSchema } from '$lib/validation/adminSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [items, sectionHeader] = await Promise.all([
		workService.getAllForAdmin(),
		contentService.getSectionHeader('work')
	]);
	return { items, sectionHeader };
};

export const actions: Actions = {
	saveHeader: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			sectionKey: 'work',
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
	togglePin: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const isPinned = formData.get('isPinned') === 'true';

		if (!id) return fail(400, { error: 'ID is required' });

		try {
			await workService.togglePin(id, isPinned);
		} catch (err: unknown) {
			const errorObj = err as Error;
			return fail(400, { error: errorObj.message || 'Failed to update pin status' });
		}

		return { success: true };
	},

	toggleVisibility: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const isVisible = formData.get('isVisible') === 'true';

		if (!id) return fail(400, { error: 'ID is required' });

		await workService.toggleVisibility(id, isVisible);
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) return fail(400, { error: 'ID is required' });

		await workService.deleteWork(id);
		return { success: true };
	},

	reorder: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const direction = formData.get('direction')?.toString();

		if (!id || (direction !== 'up' && direction !== 'down')) {
			return fail(400, { error: 'Invalid parameters' });
		}

		await workService.reorderWork(id, direction);
		return { success: true };
	},

	reorderPinned: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const direction = formData.get('direction')?.toString();

		if (!id || (direction !== 'up' && direction !== 'down')) {
			return fail(400, { error: 'Invalid parameters' });
		}

		await workService.reorderPinned(id, direction);
		return { success: true };
	}
};
