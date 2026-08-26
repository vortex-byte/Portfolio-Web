import { analyticsService } from '$lib/server/container';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const selectedDate = url.searchParams.get('date');
	const selectedMonth = url.searchParams.get('month');

	const [dailyViews, monthlyViews, overviewMetrics] = await Promise.all([
		analyticsService.getDailyViews(30),
		analyticsService.getMonthlyViews(12),
		analyticsService.getOverviewMetrics()
	]);

	let singleDateCount: number | null = null;
	if (selectedDate) {
		singleDateCount = await analyticsService.getViewsForDate(selectedDate);
	}

	let singleMonthCount: number | null = null;
	if (selectedMonth) {
		singleMonthCount = await analyticsService.getViewsForMonth(selectedMonth);
	}

	return {
		dailyViews,
		monthlyViews,
		overviewMetrics,
		selectedDate,
		singleDateCount,
		selectedMonth,
		singleMonthCount
	};
};

export const actions: Actions = {
	lookupDate: async ({ request }) => {
		const formData = await request.formData();
		const dateStr = formData.get('date')?.toString().trim();
		if (!dateStr) return { dateCount: null };
		const count = await analyticsService.getViewsForDate(dateStr);
		return { dateStr, dateCount: count };
	},

	lookupMonth: async ({ request }) => {
		const formData = await request.formData();
		const monthStr = formData.get('month')?.toString().trim();
		if (!monthStr) return { monthCount: null };
		const count = await analyticsService.getViewsForMonth(monthStr);
		return { monthStr, monthCount: count };
	}
};
