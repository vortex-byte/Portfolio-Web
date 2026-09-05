import type { IEmailQueue, SendEmailJobData } from './IEmailQueue';
import { EmailJobProcessor } from '$lib/server/services/EmailJobProcessor';
import { smtpRepository } from '$lib/server/repositories/SmtpRepository';
import { nodemailerProvider } from '$lib/server/mailer/NodemailerProvider';
import { logger } from '$lib/server/logger';

const processor = new EmailJobProcessor(smtpRepository, nodemailerProvider);

export class DirectEmailQueue implements IEmailQueue {
	async enqueueSendEmail(data: SendEmailJobData): Promise<void> {
		try {
			await processor.processSendEmail(data);
			logger.info({ email: data.email }, 'Direct email sent successfully');
		} catch (err) {
			logger.error({ err, email: data.email }, 'Failed to send direct contact notification email');
		}
	}
}

export const directEmailQueue = new DirectEmailQueue();
