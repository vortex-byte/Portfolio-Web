export interface EmailOptions {
	fromName: string;
	fromEmail: string;
	to: string;
	replyTo?: string;
	subject: string;
	text: string;
	html: string;
}

export interface SmtpTransportConfig {
	host: string;
	port: number;
	user?: string | null;
	pass?: string | null;
}

export interface IMailerProvider {
	send(options: EmailOptions, config: SmtpTransportConfig): Promise<void>;
}
