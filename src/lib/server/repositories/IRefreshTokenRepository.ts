import type { RefreshTokenEntity } from '$lib/server/domain/interfaces/IUser';

export interface IRefreshTokenRepository {
	storeToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshTokenEntity>;
	findValidToken(userId: string, tokenHash: string): Promise<RefreshTokenEntity | null>;
	revokeToken(tokenHash: string): Promise<void>;
}
