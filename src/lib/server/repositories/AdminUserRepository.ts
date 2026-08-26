import { db } from '$lib/server/db';
import { adminUsers } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { IAdminUserRepository, UpdateAdminUserData } from './IAdminUserRepository';
import type { AdminUserEntity } from '$lib/server/domain/interfaces/IUser';

export class AdminUserRepository implements IAdminUserRepository {
	async findByEmail(email: string): Promise<AdminUserEntity | null> {
		const res = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
		return res[0] ?? null;
	}

	async findById(id: string): Promise<AdminUserEntity | null> {
		const res = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
		return res[0] ?? null;
	}

	async updateUser(id: string, data: UpdateAdminUserData): Promise<AdminUserEntity> {
		const updateFields: Record<string, unknown> = {
			updatedAt: new Date()
		};
		if (data.name !== undefined) updateFields.name = data.name;
		if (data.email !== undefined) updateFields.email = data.email;
		if (data.passwordHash !== undefined) {
			updateFields.passwordHash = data.passwordHash;
			updateFields.tokenVersion = sql`${adminUsers.tokenVersion} + 1`;
		}

		const [res] = await db
			.update(adminUsers)
			.set(updateFields)
			.where(eq(adminUsers.id, id))
			.returning();

		return res;
	}
}

export const adminUserRepository = new AdminUserRepository();
