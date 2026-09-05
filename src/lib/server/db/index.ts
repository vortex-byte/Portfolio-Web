import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$lib/server/env';

const client = postgres(env.DATABASE_URL, { max: env.NODE_ENV === 'production' ? 1 : 10 });

export const db = drizzle(client, { schema });
