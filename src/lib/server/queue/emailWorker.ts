import { Worker } from 'bullmq';
import { queueRedis } from '$lib/server/cache/redis';
import { EMAIL_QUEUE_NAME } from './BullMQEmailQueue';
import type { SendEmailJobData } from './IEmailQueue';
import { EmailJobProcessor } from '$lib/server/services/EmailJobProcessor';
import { smtpRepository } from '$lib/server/repositories/SmtpRepository';
import { nodemailerProvider } from '$lib/server/mailer/NodemailerProvider';
import { logger } from '$lib/server/logger';

const processor = new EmailJobProcessor(smtpRepository, nodemailerProvider);

let worker: Worker<SendEmailJobData> | null = null;

export function initEmailWorker(): Worker<SendEmailJobData> {
	if (worker) return worker;

	worker = new Worker<SendEmailJobData>(
		EMAIL_QUEUE_NAME,
		async (job) => {
			logger.info({ jobId: job.id, attempt: job.attemptsMade + 1 }, 'Processing queued email job');
			await processor.processSendEmail(job.data);
		},
		{
			connection: queueRedis,
			concurrency: 2
		}
	);

	worker.on('completed', (job) => {
		logger.info({ jobId: job.id }, 'Queued email job completed successfully');
	});

	worker.on('failed', (job, err) => {
		logger.error(
			{ jobId: job?.id, err, attemptsMade: job?.attemptsMade },
			'Queued email job failed'
		);
	});

	return worker;
}
