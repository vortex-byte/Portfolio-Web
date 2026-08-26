import { db } from '$lib/server/db';
import { visitorLogs, visitorDailyStats, visitorMonthlyStats } from '$lib/server/db/schema';
import { eq, gte, lte, and, desc, sum, count, sql } from 'drizzle-orm';
import type { IAnalyticsRepository, LogVisitInput } from './IAnalyticsRepository';
import type {
	VisitorDailyStatEntity,
	VisitorMonthlyStatEntity,
	OverviewMetrics
} from '$lib/server/domain/interfaces/IAnalytics';

export class AnalyticsRepository implements IAnalyticsRepository {
	async logVisit(input: LogVisitInput): Promise<void> {
		await db.insert(visitorLogs).values({
			path: input.path,
			ipHash: input.ipHash,
			visitorId: input.visitorId,
			userAgent: input.userAgent ? input.userAgent.slice(0, 255) : null,
			visitedAt: input.visitedAt
		});

		await Promise.all([
			db
				.insert(visitorDailyStats)
				.values({ date: input.dateStr, viewCount: 1, updatedAt: input.visitedAt })
				.onConflictDoUpdate({
					target: visitorDailyStats.date,
					set: { viewCount: sql`${visitorDailyStats.viewCount} + 1`, updatedAt: input.visitedAt }
				}),
			db
				.insert(visitorMonthlyStats)
				.values({ yearMonth: input.yearMonthStr, viewCount: 1, updatedAt: input.visitedAt })
				.onConflictDoUpdate({
					target: visitorMonthlyStats.yearMonth,
					set: {
						viewCount: sql`${visitorMonthlyStats.viewCount} + 1`,
						updatedAt: input.visitedAt
					}
				})
		]);
	}

	async getDailyViews(days = 30): Promise<VisitorDailyStatEntity[]> {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(endDate.getDate() - (days - 1));

		const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
		const startStr = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
		const endStr = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;

		return db
			.select()
			.from(visitorDailyStats)
			.where(and(gte(visitorDailyStats.date, startStr), lte(visitorDailyStats.date, endStr)))
			.orderBy(visitorDailyStats.date);
	}

	async getMonthlyViews(months = 12): Promise<VisitorMonthlyStatEntity[]> {
		const rows = await db
			.select()
			.from(visitorMonthlyStats)
			.orderBy(desc(visitorMonthlyStats.yearMonth))
			.limit(months);

		return rows.reverse();
	}

	async getViewsForDate(dateStr: string): Promise<number> {
		const res = await db
			.select()
			.from(visitorDailyStats)
			.where(eq(visitorDailyStats.date, dateStr))
			.limit(1);

		return res[0]?.viewCount ?? 0;
	}

	async getViewsForMonth(yearMonthStr: string): Promise<number> {
		const res = await db
			.select()
			.from(visitorMonthlyStats)
			.where(eq(visitorMonthlyStats.yearMonth, yearMonthStr))
			.limit(1);

		return res[0]?.viewCount ?? 0;
	}

	async getOverviewMetrics(todayStr: string, monthStr: string): Promise<OverviewMetrics> {
		const [todayViews, monthViews, [{ value: totalViews }], [{ value: uniqueVisitors }]] =
			await Promise.all([
				this.getViewsForDate(todayStr),
				this.getViewsForMonth(monthStr),
				db.select({ value: sum(visitorDailyStats.viewCount) }).from(visitorDailyStats),
				db.select({ value: count(sql`DISTINCT ${visitorLogs.visitorId}`) }).from(visitorLogs)
			]);

		return {
			todayViews,
			monthViews,
			totalViews: Number(totalViews || 0),
			uniqueVisitors: Number(uniqueVisitors || 0)
		};
	}
}

export const analyticsRepository = new AnalyticsRepository();
