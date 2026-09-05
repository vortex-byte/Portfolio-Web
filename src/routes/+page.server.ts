import {
	contentService,
	workService,
	contactService,
	analyticsService
} from '$lib/server/container';
import { env } from '$lib/server/env';
import { logger } from '$lib/server/logger';
import { contactSchema } from '$lib/validation/contactSchema';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, getClientAddress, request, cookies }) => {
	const visitorId = analyticsService.ensureVisitorCookie(cookies);
	analyticsService
		.trackVisit(url.pathname, getClientAddress(), request.headers.get('user-agent'), visitorId)
		.catch(() => {});

	const [hero, about, services, skills, pinnedWork, sectionHeaders] = await Promise.all([
		contentService.getHero(),
		contentService.getAbout(),
		contentService.getServices(),
		contentService.getSkills(),
		workService.getPinnedWork(),
		contentService.getSectionHeaders()
	]);

	return {
		hero,
		about,
		services,
		skills,
		pinnedWork,
		sectionHeaders
	};
};

export const actions: Actions = {
	contact: async ({ request, getClientAddress }) => {
		const formData = await request.formData();
		const rawName = formData.get('name')?.toString() ?? '';
		const rawEmail = formData.get('email')?.toString() ?? '';
		const rawMessage = formData.get('message')?.toString() ?? '';

		const values = { name: rawName, email: rawEmail, message: rawMessage };

		const result = contactSchema.safeParse(values);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0]?.toString();
				if (field && !fieldErrors[field]) {
					fieldErrors[field] = issue.message;
				}
			}
			return fail(400, {
				success: false,
				errors: fieldErrors,
				values
			});
		}

		try {
			const ip = getClientAddress();

			if (env.NODE_ENV === 'production' && env.TURNSTILE_SECRET_KEY) {
				const turnstileToken = formData.get('cf-turnstile-response')?.toString();
				if (!turnstileToken) {
					return fail(400, {
						success: false,
						error: 'Security challenge validation failed. Please try again.',
						values
					});
				}

				const verifyRes = await fetch(
					'https://challenges.cloudflare.com/turnstile/v0/siteverify',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: new URLSearchParams({
							secret: env.TURNSTILE_SECRET_KEY,
							response: turnstileToken,
							remoteip: ip
						})
					}
				);

				const outcome = (await verifyRes.json()) as { success?: boolean };
				if (!outcome.success) {
					return fail(400, {
						success: false,
						error: 'Security challenge failed. Please refresh and try again.',
						values
					});
				}
			}

			await contactService.createSubmission(result.data, ip);
			return {
				success: true
			};
		} catch (err: unknown) {
			const errorObj = err as Error;
			logger.error({ err }, 'Contact form submission error');
			const errorMessage = env.PUBLIC_DEBUG_MODE
				? errorObj?.message || 'Failed to submit contact message'
				: 'Failed to submit contact message. Please try again later.';
			return fail(500, {
				success: false,
				error: errorMessage,
				values
			});
		}
	}
};
