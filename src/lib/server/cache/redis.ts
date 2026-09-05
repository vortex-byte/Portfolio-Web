import Redis from 'ioredis';
import { env } from '$lib/server/env';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
	globalForRedis.redis ??
	new Redis(env.REDIS_URL, {
		maxRetriesPerRequest: 3,
		enableReadyCheck: true,
		family: 4
	});

if (env.NODE_ENV !== 'production') {
	globalForRedis.redis = redis;
}
