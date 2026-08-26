import Redis from 'ioredis';
import { env } from '$lib/server/env';

const globalForRedis = globalThis as unknown as { redis?: Redis; queueRedis?: Redis };

export const redis =
	globalForRedis.redis ??
	new Redis(env.REDIS_URL, {
		maxRetriesPerRequest: 3,
		enableReadyCheck: true
	});

export const queueRedis =
	globalForRedis.queueRedis ??
	new Redis(env.REDIS_URL, {
		maxRetriesPerRequest: null,
		enableReadyCheck: false
	});

if (env.NODE_ENV !== 'production') {
	globalForRedis.redis = redis;
	globalForRedis.queueRedis = queueRedis;
}
