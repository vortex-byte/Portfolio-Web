import { adminUserRepository } from '$lib/server/repositories/AdminUserRepository';
import { refreshTokenRepository } from '$lib/server/repositories/RefreshTokenRepository';
import { contentRepository } from '$lib/server/repositories/ContentRepository';
import { workRepository } from '$lib/server/repositories/WorkRepository';
import { analyticsRepository } from '$lib/server/repositories/AnalyticsRepository';
import { contactRepository } from '$lib/server/repositories/ContactRepository';
import { smtpRepository } from '$lib/server/repositories/SmtpRepository';

import { cacheService } from '$lib/server/cache/CacheService';
import { localStorageProvider } from '$lib/server/storage/LocalStorageProvider';
import { argon2PasswordHasher } from '$lib/server/security/Argon2PasswordHasher';
import { nodemailerProvider } from '$lib/server/mailer/NodemailerProvider';
import { emailQueue } from '$lib/server/queue/BullMQEmailQueue';

import { AuthService } from '$lib/server/services/AuthService';
import { ContentService } from '$lib/server/services/ContentService';
import { WorkService } from '$lib/server/services/WorkService';
import { AnalyticsService } from '$lib/server/services/AnalyticsService';
import { ContactService } from '$lib/server/services/ContactService';

export {
	adminUserRepository,
	refreshTokenRepository,
	contentRepository,
	workRepository,
	analyticsRepository,
	contactRepository,
	smtpRepository
};

export { cacheService, localStorageProvider, argon2PasswordHasher, nodemailerProvider, emailQueue };

export const authService = new AuthService(
	adminUserRepository,
	refreshTokenRepository,
	argon2PasswordHasher
);

export const contentService = new ContentService(contentRepository, cacheService);

export const workService = new WorkService(workRepository, cacheService, localStorageProvider);

export const analyticsService = new AnalyticsService(analyticsRepository);

export const contactService = new ContactService(contactRepository, emailQueue);
