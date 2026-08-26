import { redis } from '$lib/server/cache/redis';
import { env } from '$lib/server/env';
import { parseDuration } from '$lib/server/utils';

const threshold = env.RATE_LIMIT_LOGIN_MAX;
const windowSeconds = parseDuration(env.LOGIN_LOCKOUT_WINDOW);
const lockoutSeconds = parseDuration(env.LOGIN_LOCKOUT_DURATION);

export async function recordFailedAttempt(identifier: string): Promise<number> {
	const key = `login_attempts:${identifier}`;
	const count = await redis.incr(key);
	if (count === 1) {
		await redis.expire(key, windowSeconds);
	}
	if (count >= threshold) {
		await redis.setex(`lockout:${identifier}`, lockoutSeconds, '1');
	}
	return count;
}

export async function isLocked(identifier: string): Promise<boolean> {
	const result = await redis.exists(`lockout:${identifier}`);
	return result === 1;
}

export async function resetAttempts(identifier: string): Promise<void> {
	await redis.del(`login_attempts:${identifier}`);
}

export async function getLockoutTtl(identifier: string): Promise<number> {
	const ttl = await redis.ttl(`lockout:${identifier}`);
	return ttl > 0 ? ttl : 0;
}
