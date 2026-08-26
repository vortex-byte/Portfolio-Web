import { contentService } from '$lib/server/container';
import { skillSchema, sectionHeaderSchema } from '$lib/validation/adminSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [items, sectionHeader] = await Promise.all([
		contentService.getSkills(false),
		contentService.getSectionHeader('skills')
	]);
	return { items, sectionHeader };
};

export const actions: Actions = {
	saveHeader: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			sectionKey: 'skills',
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
			name: formData.get('name')?.toString() ?? '',
			icon: formData.get('icon')?.toString() || null,
			category: formData.get('category')?.toString() || 'General',
			proficiency: formData.get('proficiency')?.toString() || null
		};

		const result = skillSchema.safeParse(input);
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid skill input' });
		}

		await contentService.createSkill(result.data);
		return { success: true };
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const input = {
			name: formData.get('name')?.toString() ?? '',
			icon: formData.get('icon')?.toString() || null,
			category: formData.get('category')?.toString() || 'General',
			proficiency: formData.get('proficiency')?.toString() || null
		};

		if (!id) return fail(400, { error: 'ID is required' });

		const result = skillSchema.safeParse(input);
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid skill input' });
		}

		await contentService.updateSkill({ id, ...result.data });
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID is required' });

		await contentService.deleteSkill(id);
		return { success: true };
	},

	toggleVisibility: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const isVisible = formData.get('isVisible') === 'true';

		if (!id) return fail(400, { error: 'ID is required' });

		await contentService.toggleSkillVisibility(id, isVisible);
		return { success: true };
	},

	reorder: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const direction = formData.get('direction')?.toString();

		if (!id || (direction !== 'up' && direction !== 'down')) {
			return fail(400, { error: 'Invalid parameters' });
		}

		await contentService.reorderSkill(id, direction);
		return { success: true };
	}
};
