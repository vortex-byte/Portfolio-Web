import type {
	VisitorDailyStatEntity,
	VisitorMonthlyStatEntity,
	OverviewMetrics
} from '$lib/server/domain/interfaces/IAnalytics';

export interface LogVisitInput {
	path: string;
	ipHash: string;
	visitorId: string;
	userAgent?: string | null;
	visitedAt: Date;
	dateStr: string;
	yearMonthStr: string;
}

export interface IAnalyticsRepository {
	logVisit(input: LogVisitInput): Promise<void>;
	getDailyViews(days?: number): Promise<VisitorDailyStatEntity[]>;
	getMonthlyViews(months?: number): Promise<VisitorMonthlyStatEntity[]>;
	getViewsForDate(dateStr: string): Promise<number>;
	getViewsForMonth(yearMonthStr: string): Promise<number>;
	getOverviewMetrics(todayStr: string, monthStr: string): Promise<OverviewMetrics>;
}
