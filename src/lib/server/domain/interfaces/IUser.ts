export interface AdminUserEntity {
	id: string;
	email: string;
	passwordHash: string;
	name: string;
	tokenVersion: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface RefreshTokenEntity {
	id: string;
	adminUserId: string;
	tokenHash: string;
	expiresAt: Date;
	revokedAt: Date | null;
	createdAt: Date;
}
