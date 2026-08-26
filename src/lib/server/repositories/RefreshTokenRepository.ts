import { db } from '$lib/server/db';
import { refreshTokens } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { IRefreshTokenRepository } from './IRefreshTokenRepository';
import type { RefreshTokenEntity } from '$lib/server/domain/interfaces/IUser';

export class RefreshTokenRepository implements IRefreshTokenRepository {
	async storeToken(
		userId: string,
		tokenHash: string,
		expiresAt: Date
	): Promise<RefreshTokenEntity> {
		const [res] = await db
			.insert(refreshTokens)
			.values({
				adminUserId: userId,
				tokenHash,
				expiresAt
			})
			.returning();

		return res;
	}

	async findValidToken(userId: string, tokenHash: string): Promise<RefreshTokenEntity | null> {
		const res = await db
			.select()
			.from(refreshTokens)
			.where(and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.adminUserId, userId)))
			.limit(1);

		const token = res[0] ?? null;
		if (!token) return null;
		if (token.revokedAt !== null) return null;
		if (token.expiresAt < new Date()) return null;

		return token;
	}

	async revokeToken(tokenHash: string): Promise<void> {
		await db
			.update(refreshTokens)
			.set({ revokedAt: new Date() })
			.where(eq(refreshTokens.tokenHash, tokenHash));
	}
}

export const refreshTokenRepository = new RefreshTokenRepository();
