import { db } from '$lib/server/db';
import { contactMessages } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import type {
	IContactRepository,
	SaveContactMessageInput,
	ContactMessageRecord,
	PaginatedMessagesResult
} from './IContactRepository';

export class ContactRepository implements IContactRepository {
	async saveMessage(input: SaveContactMessageInput): Promise<ContactMessageRecord> {
		const [result] = await db
			.insert(contactMessages)
			.values({
				name: input.name,
				email: input.email,
				message: input.message,
				ipAddress: input.ipAddress ?? null,
				isRead: false
			})
			.returning();

		return result;
	}

	async getMessages(limit: number): Promise<ContactMessageRecord[]> {
		const query = db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
		if (limit) return query.limit(limit);
		return query;
	}

	async getPaginatedMessages(page = 1, pageSize = 10): Promise<PaginatedMessagesResult> {
		const offset = (page - 1) * pageSize;

		const items = await db
			.select()
			.from(contactMessages)
			.orderBy(desc(contactMessages.createdAt))
			.limit(pageSize)
			.offset(offset);

		const [{ value: totalCount }] = await db.select({ value: count() }).from(contactMessages);

		return {
			items,
			totalCount,
			totalPages: Math.ceil(totalCount / pageSize),
			page,
			pageSize
		};
	}

	async markRead(id: string, isRead: boolean): Promise<void> {
		await db.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id));
	}

	async deleteMessage(id: string): Promise<void> {
		await db.delete(contactMessages).where(eq(contactMessages.id, id));
	}

	async getUnreadCount(): Promise<number> {
		const [{ value }] = await db
			.select({ value: count() })
			.from(contactMessages)
			.where(eq(contactMessages.isRead, false));
		return value;
	}
}

export const contactRepository = new ContactRepository();
