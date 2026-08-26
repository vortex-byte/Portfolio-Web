import { workService, analyticsService } from '$lib/server/container';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, getClientAddress, request, cookies }) => {
	const visitorId = analyticsService.ensureVisitorCookie(cookies);
	analyticsService
		.trackVisit(url.pathname, getClientAddress(), request.headers.get('user-agent'), visitorId)
		.catch(() => {});

	const work = await workService.getWorkBySlug(params.slug);

	if (!work) {
		throw error(404, {
			message: 'Work item not found'
		});
	}

	return {
		work
	};
};
