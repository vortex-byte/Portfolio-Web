export interface SaveContactMessageInput {
	name: string;
	email: string;
	message: string;
	ipAddress?: string | null;
}

export interface ContactMessageRecord {
	id: string;
	name: string;
	email: string;
	message: string;
	ipAddress: string | null;
	isRead: boolean;
	createdAt: Date;
}

export interface PaginatedMessagesResult {
	items: ContactMessageRecord[];
	totalCount: number;
	totalPages: number;
	page: number;
	pageSize: number;
}

export interface IContactRepository {
	saveMessage(input: SaveContactMessageInput): Promise<ContactMessageRecord>;
	getMessages(limit: number): Promise<ContactMessageRecord[]>;
	getPaginatedMessages(page?: number, pageSize?: number): Promise<PaginatedMessagesResult>;
	markRead(id: string, isRead: boolean): Promise<void>;
	deleteMessage(id: string): Promise<void>;
	getUnreadCount(): Promise<number>;
}
