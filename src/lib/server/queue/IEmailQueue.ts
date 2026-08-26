export interface SendEmailJobData {
	name: string;
	email: string;
	message: string;
}

export interface IEmailQueue {
	enqueueSendEmail(data: SendEmailJobData): Promise<void>;
}
