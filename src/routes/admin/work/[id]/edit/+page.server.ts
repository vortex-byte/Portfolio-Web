import { workService, localStorageProvider } from '$lib/server/container';
import { sanitizeHtml, sanitizePlain } from '$lib/server/security/sanitizer';
import { workItemSchema } from '$lib/validation/adminSchemas';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const item = await workService.getById(params.id);

	if (!item) {
		throw error(404, 'Work item not found');
	}

	return {
		work: item,
		images: item.images
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const input = {
			title: formData.get('title')?.toString() ?? '',
			shortDescription: formData.get('shortDescription')?.toString() ?? '',
			longDescription: formData.get('longDescription')?.toString() ?? '',
			coverImageUrl: formData.get('coverImageUrl')?.toString() ?? '',
			coverImageAlt: formData.get('coverImageAlt')?.toString() || null,
			projectUrl: formData.get('projectUrl')?.toString() || null,
			repoUrl: formData.get('repoUrl')?.toString() || null,
			techStack: formData
				.getAll('techStack')
				.map((t) => t.toString().trim())
				.filter(Boolean)
		};

		const galleryFiles = formData
			.getAll('galleryFiles')
			.filter((f): f is File => f instanceof File && f.size > 0);
		const galleryAlts = formData.getAll('galleryAlts').map((a) => a.toString().trim());

		const result = workItemSchema.safeParse(input);
		if (!result.success) {
			const formattedError = result.error.issues.map((i) => i.message).join(', ');
			return fail(400, { error: formattedError || 'Invalid work item input' });
		}

		const data = result.data;
		const cleanLongDescription = sanitizeHtml(data.longDescription);
		const cleanShortDescription = sanitizePlain(data.shortDescription);

		await workService.updateWork({
			id: params.id,
			title: sanitizePlain(data.title),
			shortDescription: cleanShortDescription,
			longDescription: cleanLongDescription,
			coverImageUrl: data.coverImageUrl,
			coverImageAlt: data.coverImageAlt,
			projectUrl: data.projectUrl,
			repoUrl: data.repoUrl,
			techStack: data.techStack ?? []
		});

		if (galleryFiles.length > 0) {
			for (let i = 0; i < galleryFiles.length; i++) {
				try {
					const { url } = await localStorageProvider.saveImage(galleryFiles[i], 'work-gallery');
					await workService.addGalleryImage(params.id, url, galleryAlts[i] || null);
				} catch (err) {
					console.error('Failed to save gallery file during work update:', err);
				}
			}
		}

		throw redirect(302, '/admin/work');
	},

	addGalleryImage: async ({ request, params }) => {
		const formData = await request.formData();
		const file = formData.get('galleryFile') as File | null;
		const imageAlt = formData.get('galleryAlt')?.toString().trim() || null;

		if (!file || file.size === 0) {
			return fail(400, { error: 'Please select an image file to upload' });
		}

		try {
			const { url } = await localStorageProvider.saveImage(file, 'work-gallery');
			await workService.addGalleryImage(params.id, url, imageAlt);
			return { success: true };
		} catch (err: unknown) {
			const errorObj = err as Error;
			return fail(400, { error: errorObj.message || 'Gallery image upload failed' });
		}
	},

	deleteGalleryImage: async ({ request }) => {
		const formData = await request.formData();
		const imageId = formData.get('imageId')?.toString();

		if (!imageId) return fail(400, { error: 'Image ID required' });

		await workService.deleteGalleryImage(imageId);
		return { success: true };
	}
};
