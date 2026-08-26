import { redis } from '$lib/server/cache/redis';

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
}

export async function checkRateLimit(
	key: string,
	max: number,
	windowSeconds: number
): Promise<RateLimitResult> {
	const count = await redis.incr(key);
	if (count === 1) {
		await redis.expire(key, windowSeconds);
	}
	return {
		allowed: count <= max,
		remaining: Math.max(0, max - count)
	};
}
