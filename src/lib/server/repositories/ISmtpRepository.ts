export interface SmtpSettingsRecord {
	id: number;
	host: string | null;
	port: number | null;
	user: string | null;
	pass: string | null;
	fromName: string | null;
	fromEmail: string | null;
	targetEmail: string | null;
}

export interface SaveSmtpInput {
	host: string | null;
	port: number;
	user: string | null;
	pass: string | null;
	fromName: string | null;
	fromEmail: string | null;
	targetEmail: string | null;
}

export interface ISmtpRepository {
	getSettings(): Promise<SmtpSettingsRecord | null>;
	upsertSettings(input: SaveSmtpInput): Promise<SmtpSettingsRecord>;
}
