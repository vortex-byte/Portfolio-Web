import { sanitizePlain } from '$lib/server/security/sanitizer';
import { logger } from '$lib/server/logger';
import type { ContactInput } from '$lib/validation/contactSchema';
import type { IContactRepository } from '$lib/server/repositories/IContactRepository';
import type { IEmailQueue } from '$lib/server/queue/IEmailQueue';

export class ContactService {
	constructor(
		private contactRepo: IContactRepository,
		private emailQueue: IEmailQueue
	) {}

	async createSubmission(input: ContactInput, ipAddress?: string): Promise<void> {
		const cleanName = sanitizePlain(input.name);
		const cleanEmail = sanitizePlain(input.email);
		const cleanMessage = sanitizePlain(input.message);

		await this.contactRepo.saveMessage({
			name: cleanName,
			email: cleanEmail,
			message: cleanMessage,
			ipAddress: ipAddress ?? null
		});

		logger.info({ email: cleanEmail }, 'Contact message stored in DB');

		await this.emailQueue.enqueueSendEmail({
			name: cleanName,
			email: cleanEmail,
			message: cleanMessage
		});
	}
}
