import { Queue } from 'bullmq';
import { queueRedis } from '$lib/server/cache/redis';
import type { IEmailQueue, SendEmailJobData } from './IEmailQueue';

export const EMAIL_QUEUE_NAME = 'email-notifications';

export class BullMQEmailQueue implements IEmailQueue {
	private queue: Queue<SendEmailJobData>;

	constructor() {
		this.queue = new Queue<SendEmailJobData>(EMAIL_QUEUE_NAME, {
			connection: queueRedis,
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 5000
				},
				removeOnComplete: {
					count: 100
				},
				removeOnFail: {
					count: 500
				}
			}
		});
	}

	async enqueueSendEmail(data: SendEmailJobData): Promise<void> {
		await this.queue.add('send-contact-email', data);
	}
}

export const emailQueue = new BullMQEmailQueue();
