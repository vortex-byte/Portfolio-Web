import { redis } from './redis';
import type { ICacheService } from './ICacheService';

const DEFAULT_TTL = 3600;

export class RedisCacheService implements ICacheService {
	async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
		const cached = await redis.get(key);
		if (cached !== null) {
			return JSON.parse(cached) as T;
		}
		const fresh = await fetcher();
		await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
		return fresh;
	}

	async get<T>(key: string): Promise<T | null> {
		const cached = await redis.get(key);
		if (cached === null) return null;
		return JSON.parse(cached) as T;
	}

	async set<T>(key: string, ttlSeconds: number = DEFAULT_TTL, value: T): Promise<void> {
		await redis.setex(key, ttlSeconds, JSON.stringify(value));
	}

	async delete(key: string): Promise<void> {
		await redis.del(key);
	}

	async invalidatePattern(pattern: string): Promise<void> {
		const keys = await redis.keys(pattern);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	}
}

export const cacheService = new RedisCacheService();
