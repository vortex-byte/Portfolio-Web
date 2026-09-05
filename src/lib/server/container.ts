import { adminUserRepository } from '$lib/server/repositories/AdminUserRepository';
import { refreshTokenRepository } from '$lib/server/repositories/RefreshTokenRepository';
import { contentRepository } from '$lib/server/repositories/ContentRepository';
import { workRepository } from '$lib/server/repositories/WorkRepository';
import { analyticsRepository } from '$lib/server/repositories/AnalyticsRepository';
import { contactRepository } from '$lib/server/repositories/ContactRepository';
import { smtpRepository } from '$lib/server/repositories/SmtpRepository';

import { cacheService } from '$lib/server/cache/CacheService';
import { R2StorageProvider } from '$lib/server/storage/R2StorageProvider';
import { argon2PasswordHasher } from '$lib/server/security/Argon2PasswordHasher';
import { nodemailerProvider } from '$lib/server/mailer/NodemailerProvider';
import { directEmailQueue } from '$lib/server/queue/DirectEmailQueue';

import { AuthService } from '$lib/server/services/AuthService';
import { ContentService } from '$lib/server/services/ContentService';
import { WorkService } from '$lib/server/services/WorkService';
import { AnalyticsService } from '$lib/server/services/AnalyticsService';
import { ContactService } from '$lib/server/services/ContactService';

export const storageProvider = new R2StorageProvider();

export {
	adminUserRepository,
	refreshTokenRepository,
	contentRepository,
	workRepository,
	analyticsRepository,
	contactRepository,
	smtpRepository
};

export { cacheService, argon2PasswordHasher, nodemailerProvider, directEmailQueue as emailQueue };

export const authService = new AuthService(
	adminUserRepository,
	refreshTokenRepository,
	argon2PasswordHasher
);

export const contentService = new ContentService(contentRepository, cacheService, storageProvider);

export const workService = new WorkService(workRepository, cacheService, storageProvider);

export const analyticsService = new AnalyticsService(analyticsRepository);

export const contactService = new ContactService(contactRepository, directEmailQueue);
