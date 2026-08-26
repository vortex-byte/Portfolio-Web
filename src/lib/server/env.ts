import { env as dynamicEnv } from '$env/dynamic/private';
import { z } from 'zod';

const PLACEHOLDER_MARKERS = ['change_me', 'changeme', 'your_secret', 'your-password'];

function isPlaceholder(value: string): boolean {
	const lower = value.toLowerCase();
	return PLACEHOLDER_MARKERS.some((m) => lower.includes(m));
}

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PUBLIC_DEBUG_MODE: z
		.string()
		.default('false')
		.transform((v) => v === 'true'),
	APP_PORT: z.coerce.number().default(3000),
	APP_BASE_URL: z.string().default('http://localhost:3000'),
	PUBLIC_SITE_TITLE: z.string().default('Portfolio'),
	PUBLIC_SITE_DESCRIPTION: z.string().default(''),

	DATABASE_URL: z.string().default('postgres://postgres:root@localhost:5432/portfolio'),
	REDIS_URL: z.string().default('redis://localhost:6379'),

	JWT_ACCESS_SECRET: z
		.string()
		.min(32, 'JWT_ACCESS_SECRET must be at least 32 characters')
		.default('change_me_to_a_random_64_char_string_min_32_chars'),
	JWT_REFRESH_SECRET: z
		.string()
		.min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
		.default('change_me_too_to_a_random_64_char_string_min_32'),
	JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
	JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

	RATE_LIMIT_CONTACT_MAX: z.coerce.number().default(5),
	RATE_LIMIT_CONTACT_WINDOW: z.string().default('10m'),
	RATE_LIMIT_LOGIN_MAX: z.coerce.number().default(5),
	LOGIN_LOCKOUT_WINDOW: z.string().default('15m'),
	LOGIN_LOCKOUT_DURATION: z.string().default('15m'),

	UPLOAD_DIR: z.string().default('./uploads'),
	MAX_UPLOAD_SIZE_MB: z.coerce.number().default(5),

	SMTP_HOST: z.string().optional(),
	SMTP_PORT: z.coerce.number().optional(),
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
	SMTP_FROM_NAME: z.string().optional(),
	SMTP_FROM_EMAIL: z.string().email().optional().or(z.literal('')),
	TARGET_EMAIL: z.string().email().optional()
});

export function getEnv() {
	const source = { ...process.env, ...dynamicEnv };
	const parsed = envSchema.safeParse(source);
	if (!parsed.success) {
		const errors = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
		throw new Error(`Environment variable validation failed:\n${errors}`);
	}
	return parsed.data;
}

export const env = getEnv();
export type Env = z.infer<typeof envSchema>;

let asserted = false;

/**
 * Fails fast at RUNTIME (not build) if the app is running in production with
 * insecure/placeholder secrets or default DB credentials. Called once per
 * process from the request lifecycle so the build never trips on it.
 */
export function assertProductionSecurity(): void {
	if (asserted) return;
	asserted = true;

	if (env.NODE_ENV !== 'production') return;

	const problems: string[] = [];
	if (isPlaceholder(env.JWT_ACCESS_SECRET)) {
		problems.push('JWT_ACCESS_SECRET is a placeholder');
	}
	if (isPlaceholder(env.JWT_REFRESH_SECRET)) {
		problems.push('JWT_REFRESH_SECRET is a placeholder');
	}
	if (/postgres:\/\/postgres:root@localhost/.test(env.DATABASE_URL)) {
		problems.push('DATABASE_URL uses default localhost credentials');
	}

	if (problems.length > 0) {
		throw new Error(`Insecure production configuration: ${problems.join(', ')}`);
	}
}
