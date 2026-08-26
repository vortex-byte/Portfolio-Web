import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import { env } from '$lib/server/env';

const KEY = createHash('sha256').update(env.JWT_ACCESS_SECRET).digest();
const ALGORITHM = 'aes-256-gcm';

export function encryptText(text: string): string {
	if (!text) return '';
	const iv = randomBytes(12);
	const cipher = createCipheriv(ALGORITHM, KEY, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	const authTag = cipher.getAuthTag().toString('hex');
	return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptText(cipherText: string): string {
	if (!cipherText) return '';
	try {
		const parts = cipherText.split(':');
		if (parts.length !== 3) return cipherText;
		const iv = Buffer.from(parts[0], 'hex');
		const authTag = Buffer.from(parts[1], 'hex');
		const encryptedText = parts[2];
		const decipher = createDecipheriv(ALGORITHM, KEY, iv);
		decipher.setAuthTag(authTag);
		let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	} catch {
		return cipherText;
	}
}
