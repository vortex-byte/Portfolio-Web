export interface VisitorLogEntity {
	id: number;
	path: string;
	ipHash: string | null;
	visitorId: string | null;
	userAgent: string | null;
	visitedAt: Date;
}

export interface VisitorDailyStatEntity {
	date: string;
	viewCount: number;
	updatedAt: Date;
}

export interface VisitorMonthlyStatEntity {
	yearMonth: string;
	viewCount: number;
	updatedAt: Date;
}

export interface OverviewMetrics {
	todayViews: number;
	monthViews: number;
	totalViews: number;
	uniqueVisitors: number;
}

export interface AdminOverviewMetrics extends OverviewMetrics {
	unreadMessages: number;
	totalWork: number;
	totalSkills: number;
	totalServices: number;
}
