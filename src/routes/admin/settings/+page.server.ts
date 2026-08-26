import { smtpRepository, nodemailerProvider } from '$lib/server/container';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad, Actions } from './$types';

const smtpSchema = z.object({
	host: z.string().trim().max(255).optional().nullable(),
	port: z.coerce.number().int().min(1).max(65535).default(587),
	user: z.string().trim().max(255).optional().nullable(),
	pass: z.string().optional().nullable(),
	fromName: z.string().trim().max(255).optional().nullable(),
	fromEmail: z
		.string()
		.trim()
		.email('Invalid sender email')
		.optional()
		.or(z.literal(''))
		.nullable(),
	targetEmail: z
		.string()
		.trim()
		.email('Invalid notification email')
		.optional()
		.or(z.literal(''))
		.nullable()
});

export const load: PageServerLoad = async () => {
	const smtp = await smtpRepository.getSettings();

	return {
		smtp: smtp
			? {
					...smtp,
					hasPass: Boolean(smtp.pass)
				}
			: null
	};
};

export const actions: Actions = {
	save: async ({ request }) => {
		const formData = await request.formData();
		const input = {
			host: formData.get('host')?.toString() || null,
			port: formData.get('port') ? Number(formData.get('port')) : 587,
			user: formData.get('user')?.toString() || null,
			pass: formData.get('pass')?.toString() || null,
			fromName: formData.get('fromName')?.toString() || null,
			fromEmail: formData.get('fromEmail')?.toString() || null,
			targetEmail: formData.get('targetEmail')?.toString() || null
		};

		const result = smtpSchema.safeParse(input);
		if (!result.success) {
			return fail(400, { error: result.error.issues[0]?.message || 'Invalid SMTP settings' });
		}

		await smtpRepository.upsertSettings({
			host: result.data.host ?? null,
			port: result.data.port,
			user: result.data.user ?? null,
			pass: result.data.pass ?? null,
			fromName: result.data.fromName ?? null,
			fromEmail: result.data.fromEmail ?? null,
			targetEmail: result.data.targetEmail ?? null
		});
		return { success: true };
	},

	test: async ({ request }) => {
		const formData = await request.formData();
		const host = formData.get('host')?.toString() || null;
		const port = formData.get('port') ? Number(formData.get('port')) : 587;
		const user = formData.get('user')?.toString() || null;
		const passInput = formData.get('pass')?.toString() || null;
		const fromNameInput = formData.get('fromName')?.toString() || null;
		const fromEmailInput = formData.get('fromEmail')?.toString() || null;
		const targetEmail = formData.get('targetEmail')?.toString() || null;

		const existing = await smtpRepository.getSettings();
		const pass = passInput || existing?.pass || null;

		const targetHost = host || existing?.host;
		const finalTargetEmail = targetEmail || existing?.targetEmail;
		const senderName = fromNameInput || existing?.fromName || 'Portfolio Test';
		const senderEmail = fromEmailInput || existing?.fromEmail;

		if (!targetHost || !finalTargetEmail || !senderEmail) {
			return fail(400, {
				testError: 'SMTP Host, Sender Email, and Notification Target Email are required to test.'
			});
		}

		try {
			await nodemailerProvider.send(
				{
					fromName: senderName,
					fromEmail: senderEmail,
					to: finalTargetEmail,
					subject: 'Test Email from Portfolio Admin',
					text: 'Your SMTP settings are configured correctly!',
					html: '<p>Your SMTP settings are configured correctly!</p>'
				},
				{
					host: targetHost,
					port,
					user,
					pass
				}
			);

			return { testSuccess: true };
		} catch (err: unknown) {
			const e = err as Error;
			return fail(400, { testError: e.message || 'Failed to send test email' });
		}
	}
};
