import { workService, analyticsService } from '$lib/server/container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, getClientAddress, request, cookies }) => {
	const visitorId = analyticsService.ensureVisitorCookie(cookies);
	analyticsService
		.trackVisit(url.pathname, getClientAddress(), request.headers.get('user-agent'), visitorId)
		.catch(() => {});

	const pageParam = url.searchParams.get('page');
	const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
	const pageSize = 12;

	const workData = await workService.getWorkListing(page, pageSize);

	return {
		workData
	};
};
