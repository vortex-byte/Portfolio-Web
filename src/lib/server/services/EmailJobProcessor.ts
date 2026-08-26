import type { ISmtpRepository } from '$lib/server/repositories/ISmtpRepository';
import type { IMailerProvider } from '$lib/server/mailer/IMailerProvider';
import type { SendEmailJobData } from '$lib/server/queue/IEmailQueue';
import { env } from '$lib/server/env';
import { logger } from '$lib/server/logger';

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export class EmailJobProcessor {
	constructor(
		private smtpRepo: ISmtpRepository,
		private mailer: IMailerProvider
	) {}

	async processSendEmail(data: SendEmailJobData): Promise<void> {
		const dbSmtp = await this.smtpRepo.getSettings();

		const host = dbSmtp?.host || env.SMTP_HOST;
		const port = dbSmtp?.port || env.SMTP_PORT || 587;
		const user = dbSmtp?.user || env.SMTP_USER;
		const pass = dbSmtp?.pass || env.SMTP_PASS;
		const fromName = dbSmtp?.fromName || env.SMTP_FROM_NAME!;
		const fromEmail = dbSmtp?.fromEmail || env.SMTP_FROM_EMAIL!;
		const notifyEmail = dbSmtp?.targetEmail || env.TARGET_EMAIL!;

		if (!host || !notifyEmail || !fromEmail) {
			logger.error('SMTP configuration missing for queued email processing');
			throw new Error(
				'SMTP configuration missing. Host, Sender Email, and Notification Target Email are required.'
			);
		}

		const htmlName = escapeHtml(data.name);
		const htmlEmail = escapeHtml(data.email);
		const htmlMessage = escapeHtml(data.message).replace(/\n/g, '<br />');

		await this.mailer.send(
			{
				fromName,
				fromEmail,
				to: notifyEmail,
				replyTo: data.email,
				subject: `New Contact Submission from ${data.name}`,
				text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
				html: `<p><strong>Name:</strong> ${htmlName}</p><p><strong>Email:</strong> ${htmlEmail}</p><p><strong>Message:</strong></p><div>${htmlMessage}</div>`
			},
			{
				host,
				port,
				user,
				pass
			}
		);

		logger.info(
			{ recipient: notifyEmail, sender: data.email },
			'Queued contact notification email sent'
		);
	}
}
