import {
	contactRepository,
	workRepository,
	contentRepository,
	analyticsService
} from '$lib/server/container';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [
		unreadMessages,
		totalWork,
		totalSkills,
		totalServices,
		analyticsMetrics,
		dailyViewsPreview,
		recentMessages
	] = await Promise.all([
		contactRepository.getUnreadCount(),
		workRepository.getWorkCount(),
		contentRepository.getSkillCount(),
		contentRepository.getServiceCount(),
		analyticsService.getOverviewMetrics(),
		analyticsService.getDailyViews(14),
		contactRepository.getMessages(5)
	]);

	return {
		metrics: {
			unreadMessages,
			totalWork,
			totalSkills,
			totalServices,
			...analyticsMetrics
		},
		dailyViewsPreview,
		recentMessages
	};
};
