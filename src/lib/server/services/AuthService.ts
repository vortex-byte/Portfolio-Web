import type { IAdminUserRepository } from '$lib/server/repositories/IAdminUserRepository';
import type { IRefreshTokenRepository } from '$lib/server/repositories/IRefreshTokenRepository';
import type { IPasswordHasher } from '$lib/server/security/IPasswordHasher';
import {
	signAccessToken,
	signRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	type JwtPayload
} from '$lib/server/security/jwt';
import { setAuthCookies, clearAuthCookies, getRefreshToken } from '$lib/server/security/cookies';
import { recordFailedAttempt, isLocked, resetAttempts } from '$lib/server/security/fail2ban';
import { logger } from '$lib/server/logger';
import { hashToken } from '$lib/server/security/tokenHash';
import type { Cookies } from '@sveltejs/kit';

export interface LoginResult {
	success: boolean;
	error?: string;
}

export interface UpdateProfileInput {
	name: string;
	email: string;
	currentPassword?: string;
	newPassword?: string;
}

export interface UpdateProfileResult {
	success: boolean;
	error?: string;
}

export class AuthService {
	constructor(
		private adminUserRepo: IAdminUserRepository,
		private refreshTokenRepo: IRefreshTokenRepository,
		private passwordHasher: IPasswordHasher
	) {}

	async login(
		email: string,
		password: string,
		identifier: string,
		cookies: Cookies
	): Promise<LoginResult> {
		if (await isLocked(identifier)) {
			return { success: false, error: 'Too many failed attempts. Please try again later.' };
		}

		const user = await this.adminUserRepo.findByEmail(email);

		if (!user) {
			await recordFailedAttempt(identifier);
			return { success: false, error: 'Invalid email or password.' };
		}

		const valid = await this.passwordHasher.verify(user.passwordHash, password);
		if (!valid) {
			await recordFailedAttempt(identifier);
			return { success: false, error: 'Invalid email or password.' };
		}

		await resetAttempts(identifier);

		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			name: user.name,
			tokenVersion: user.tokenVersion
		};

		const accessToken = await signAccessToken(payload);
		const refreshToken = await signRefreshToken(payload);

		await this.storeRefreshToken(user.id, refreshToken);

		setAuthCookies(cookies, accessToken, refreshToken);

		logger.info({ userId: user.id }, 'Admin login successful');
		return { success: true };
	}

	async updateProfile(
		userId: string,
		input: UpdateProfileInput,
		cookies: Cookies
	): Promise<UpdateProfileResult> {
		const user = await this.adminUserRepo.findById(userId);
		if (!user) {
			return { success: false, error: 'Admin user not found.' };
		}

		const emailChanged = input.email.toLowerCase() !== user.email.toLowerCase();
		const passwordChanged = Boolean(input.newPassword);

		if (emailChanged || passwordChanged) {
			if (!input.currentPassword) {
				return {
					success: false,
					error: 'Current password is required to update email or password.'
				};
			}

			const valid = await this.passwordHasher.verify(user.passwordHash, input.currentPassword);
			if (!valid) {
				return { success: false, error: 'Incorrect current password.' };
			}
		}

		if (emailChanged) {
			const existing = await this.adminUserRepo.findByEmail(input.email);
			if (existing && existing.id !== userId) {
				return { success: false, error: 'Email address is already in use by another admin.' };
			}
		}

		let newPasswordHash: string | undefined;
		if (passwordChanged && input.newPassword) {
			newPasswordHash = await this.passwordHasher.hash(input.newPassword);
		}

		const updatedUser = await this.adminUserRepo.updateUser(userId, {
			name: input.name,
			email: input.email,
			passwordHash: newPasswordHash
		});

		const newPayload: JwtPayload = {
			sub: updatedUser.id,
			email: updatedUser.email,
			name: updatedUser.name,
			tokenVersion: updatedUser.tokenVersion
		};

		const accessToken = await signAccessToken(newPayload);
		const refreshToken = await signRefreshToken(newPayload);
		await this.storeRefreshToken(updatedUser.id, refreshToken);
		setAuthCookies(cookies, accessToken, refreshToken);

		logger.info({ userId }, 'Admin profile updated successfully');
		return { success: true };
	}

	async logout(cookies: Cookies): Promise<void> {
		const refreshToken = getRefreshToken(cookies);
		if (refreshToken) {
			await this.revokeRefreshToken(refreshToken);
		}
		clearAuthCookies(cookies);
	}

	async refreshSession(cookies: Cookies): Promise<boolean> {
		const refreshToken = getRefreshToken(cookies);
		if (!refreshToken) return false;

		try {
			const payload = await verifyRefreshToken(refreshToken);
			const tokenHash = hashToken(refreshToken);
			const stored = await this.refreshTokenRepo.findValidToken(payload.sub, tokenHash);
			if (!stored) return false;

			const user = await this.adminUserRepo.findById(payload.sub);
			if (!user) return false;
			if (user.tokenVersion !== payload.tokenVersion) return false;

			await this.revokeRefreshToken(refreshToken);

			const newPayload: JwtPayload = {
				sub: user.id,
				email: user.email,
				name: user.name,
				tokenVersion: user.tokenVersion
			};
			const newAccessToken = await signAccessToken(newPayload);
			const newRefreshToken = await signRefreshToken(newPayload);
			await this.storeRefreshToken(user.id, newRefreshToken);
			setAuthCookies(cookies, newAccessToken, newRefreshToken);

			return true;
		} catch {
			return false;
		}
	}

	async verifySession(accessToken: string): Promise<JwtPayload | null> {
		try {
			return await verifyAccessToken(accessToken);
		} catch {
			return null;
		}
	}

	private async storeRefreshToken(userId: string, token: string): Promise<void> {
		const tokenHash = hashToken(token);
		const { expiresAt } = this.decodeJwtExp(token);
		await this.refreshTokenRepo.storeToken(userId, tokenHash, new Date(expiresAt * 1000));
	}

	private async revokeRefreshToken(token: string): Promise<void> {
		const tokenHash = hashToken(token);
		await this.refreshTokenRepo.revokeToken(tokenHash);
	}

	private decodeJwtExp(token: string): { expiresAt: number } {
		const parts = token.split('.');
		if (parts.length !== 3) throw new Error('Invalid JWT');
		const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
		return { expiresAt: payload.exp };
	}
}
