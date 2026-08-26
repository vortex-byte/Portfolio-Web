import nodemailer from 'nodemailer';
import type { IMailerProvider, EmailOptions, SmtpTransportConfig } from './IMailerProvider';

export class NodemailerProvider implements IMailerProvider {
	async send(options: EmailOptions, config: SmtpTransportConfig): Promise<void> {
		const transporter = nodemailer.createTransport({
			host: config.host,
			port: config.port,
			secure: config.port === 465,
			auth:
				config.user && config.pass
					? {
							user: config.user,
							pass: config.pass
						}
					: undefined
		});

		await transporter.sendMail({
			from: `"${options.fromName}" <${options.fromEmail}>`,
			to: options.to,
			replyTo: options.replyTo,
			subject: options.subject,
			text: options.text,
			html: options.html
		});
	}
}

export const nodemailerProvider = new NodemailerProvider();
