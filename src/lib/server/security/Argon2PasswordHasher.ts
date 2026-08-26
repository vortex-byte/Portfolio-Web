import type { IPasswordHasher } from './IPasswordHasher';

export class Argon2PasswordHasher implements IPasswordHasher {
	async hash(password: string): Promise<string> {
		const argon2 = await import('argon2');
		return argon2.hash(password);
	}

	async verify(hash: string, password: string): Promise<boolean> {
		const argon2 = await import('argon2');
		return argon2.verify(hash, password);
	}
}

export const argon2PasswordHasher = new Argon2PasswordHasher();
