import { db } from '$lib/server/db';
import { smtpSettings } from '$lib/server/db/schema';
import { encryptText, decryptText } from '$lib/server/security/encryption';
import { eq } from 'drizzle-orm';
import type { ISmtpRepository, SmtpSettingsRecord, SaveSmtpInput } from './ISmtpRepository';

export class SmtpRepository implements ISmtpRepository {
	async getSettings(): Promise<SmtpSettingsRecord | null> {
		const res = await db.select().from(smtpSettings).where(eq(smtpSettings.id, 1)).limit(1);
		const smtp = res[0] ?? null;
		if (!smtp) return null;

		return {
			...smtp,
			pass: smtp.pass ? decryptText(smtp.pass) : null
		};
	}

	async upsertSettings(input: SaveSmtpInput): Promise<SmtpSettingsRecord> {
		const existing = await this.getSettings();

		let finalPass = existing?.pass ?? null;
		if (input.pass) {
			finalPass = input.pass;
		}

		const encryptedPass = finalPass ? encryptText(finalPass) : null;

		const [res] = await db
			.insert(smtpSettings)
			.values({
				id: 1,
				host: input.host,
				port: input.port,
				user: input.user,
				pass: encryptedPass,
				fromName: input.fromName,
				fromEmail: input.fromEmail,
				targetEmail: input.targetEmail,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: smtpSettings.id,
				set: {
					host: input.host,
					port: input.port,
					user: input.user,
					pass: encryptedPass,
					fromName: input.fromName,
					fromEmail: input.fromEmail,
					targetEmail: input.targetEmail,
					updatedAt: new Date()
				}
			})
			.returning();

		return {
			...res,
			pass: finalPass
		};
	}
}

export const smtpRepository = new SmtpRepository();
