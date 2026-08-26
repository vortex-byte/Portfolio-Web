import { createHash, randomUUID } from 'node:crypto';

export function parseDuration(str: string): number {
	const match = str.match(/^(\d+)(s|m|h|d)$/);
	if (!match) throw new Error(`Invalid duration format: ${str}`);
	const num = parseInt(match[1], 10);
	const unit = match[2];
	const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
	return num * multipliers[unit];
}

export function hashIp(ip: string, salt: string): string {
	return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export function generateUuid(): string {
	return randomUUID();
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
