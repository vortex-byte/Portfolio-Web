import type { AdminUserEntity } from '$lib/server/domain/interfaces/IUser';

export interface UpdateAdminUserData {
	name?: string;
	email?: string;
	passwordHash?: string;
}

export interface IAdminUserRepository {
	findByEmail(email: string): Promise<AdminUserEntity | null>;
	findById(id: string): Promise<AdminUserEntity | null>;
	updateUser(id: string, data: UpdateAdminUserData): Promise<AdminUserEntity>;
}
