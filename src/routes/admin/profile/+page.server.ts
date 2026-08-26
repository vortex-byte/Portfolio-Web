import { authService, adminUserRepository } from '$lib/server/container';
import { updateProfileSchema } from '$lib/validation/adminSchemas';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/admin/login');
	}

	const user = await adminUserRepository.findById(locals.user.id);

	return {
		user: user
			? {
					id: user.id,
					name: user.name,
					email: user.email
				}
			: locals.user
	};
};

export const actions: Actions = {
	update: async ({ request, locals, cookies }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const input = {
			name: formData.get('name')?.toString() ?? '',
			email: formData.get('email')?.toString() ?? '',
			currentPassword: formData.get('currentPassword')?.toString() || undefined,
			newPassword: formData.get('newPassword')?.toString() || undefined,
			confirmPassword: formData.get('confirmPassword')?.toString() || undefined
		};

		const result = updateProfileSchema.safeParse(input);
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid input data' });
		}

		const updateRes = await authService.updateProfile(
			locals.user.id,
			{
				name: result.data.name,
				email: result.data.email,
				currentPassword: result.data.currentPassword,
				newPassword: result.data.newPassword
			},
			cookies
		);

		if (!updateRes.success) {
			return fail(400, { error: updateRes.error || 'Failed to update profile' });
		}

		return { success: true };
	}
};
