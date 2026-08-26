import type { IAnalyticsRepository } from '$lib/server/repositories/IAnalyticsRepository';
import type {
	VisitorDailyStatEntity,
	VisitorMonthlyStatEntity,
	OverviewMetrics
} from '$lib/server/domain/interfaces/IAnalytics';
import { env } from '$lib/server/env';
import { hashIp, generateUuid } from '$lib/server/utils';
import { logger } from '$lib/server/logger';
import type { Cookies } from '@sveltejs/kit';

const VISITOR_COOKIE_NAME = 'visitor_id';
const VISITOR_COOKIE_MAX_AGE = 31536000;

function pad(n: number): string {
	return n < 10 ? `0${n}` : String(n);
}

function formatLocalDate(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatLocalMonth(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export class AnalyticsService {
	constructor(private analyticsRepo: IAnalyticsRepository) {}

	ensureVisitorCookie(cookies: Cookies): string {
		let visitorId = cookies.get(VISITOR_COOKIE_NAME);
		if (!visitorId) {
			visitorId = generateUuid();
			cookies.set(VISITOR_COOKIE_NAME, visitorId, {
				path: '/',
				maxAge: VISITOR_COOKIE_MAX_AGE,
				httpOnly: true,
				sameSite: 'lax',
				secure: env.NODE_ENV === 'production'
			});
		}
		return visitorId;
	}

	async trackVisit(
		path: string,
		ip: string,
		userAgent: string | null,
		visitorId: string
	): Promise<void> {
		try {
			const ipHash = hashIp(ip, env.JWT_ACCESS_SECRET);
			const now = new Date();
			const dateStr = formatLocalDate(now);
			const yearMonthStr = formatLocalMonth(now);

			await this.analyticsRepo.logVisit({
				path,
				ipHash,
				visitorId,
				userAgent,
				visitedAt: now,
				dateStr,
				yearMonthStr
			});
		} catch (err) {
			logger.error({ err }, 'Error tracking visitor analytics');
		}
	}

	async getDailyViews(days = 30): Promise<VisitorDailyStatEntity[]> {
		return this.analyticsRepo.getDailyViews(days);
	}

	async getMonthlyViews(months = 12): Promise<VisitorMonthlyStatEntity[]> {
		return this.analyticsRepo.getMonthlyViews(months);
	}

	async getViewsForDate(dateStr: string): Promise<number> {
		return this.analyticsRepo.getViewsForDate(dateStr);
	}

	async getViewsForMonth(yearMonthStr: string): Promise<number> {
		return this.analyticsRepo.getViewsForMonth(yearMonthStr);
	}

	async getOverviewMetrics(): Promise<OverviewMetrics> {
		const now = new Date();
		const todayStr = formatLocalDate(now);
		const monthStr = formatLocalMonth(now);

		return this.analyticsRepo.getOverviewMetrics(todayStr, monthStr);
	}
}
