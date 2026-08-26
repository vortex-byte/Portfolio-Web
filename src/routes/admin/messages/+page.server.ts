import { contactRepository, contentService } from '$lib/server/container';
import { sectionHeaderSchema } from '$lib/validation/adminSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const pageParam = url.searchParams.get('page');
	const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
	const pageSize = 10;

	const [messageData, sectionHeader] = await Promise.all([
		contactRepository.getPaginatedMessages(page, pageSize),
		contentService.getSectionHeader('contact')
	]);

	return { messageData, sectionHeader };
};

export const actions: Actions = {
	saveHeader: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			sectionKey: 'contact',
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
	markRead: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const isRead = formData.get('isRead') === 'true';

		if (!id) return fail(400, { error: 'ID is required' });

		await contactRepository.markRead(id, isRead);
		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) return fail(400, { error: 'ID is required' });

		await contactRepository.deleteMessage(id);
		return { success: true };
	}
};
