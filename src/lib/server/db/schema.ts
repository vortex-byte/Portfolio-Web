import {
	pgTable,
	uuid,
	varchar,
	text,
	boolean,
	integer,
	smallint,
	timestamp,
	date,
	char,
	jsonb,
	bigserial,
	check,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─── Admin ───────────────────────────────────────────────────────────

export const adminUsers = pgTable('admin_users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	name: varchar('name', { length: 150 }).notNull(),
	tokenVersion: integer('token_version').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const refreshTokens = pgTable(
	'refresh_tokens',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		adminUserId: uuid('admin_user_id')
			.notNull()
			.references(() => adminUsers.id, { onDelete: 'cascade' }),
		tokenHash: varchar('token_hash', { length: 255 }).notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		revokedAt: timestamp('revoked_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('refresh_tokens_admin_user_id_idx').on(table.adminUserId),
		index('refresh_tokens_token_hash_idx').on(table.tokenHash)
	]
);

// ─── Singleton content sections ──────────────────────────────────────

export const heroSection = pgTable(
	'hero_section',
	{
		id: smallint('id').primaryKey().default(1),
		title: varchar('title', { length: 120 }).notNull(),
		description: text('description').notNull(),
		ctaPrimaryLabel: varchar('cta_primary_label', { length: 60 }),
		ctaPrimaryUrl: varchar('cta_primary_url', { length: 255 }),
		ctaSecondaryLabel: varchar('cta_secondary_label', { length: 60 }),
		ctaSecondaryUrl: varchar('cta_secondary_url', { length: 255 }),
		showPhoto: boolean('show_photo').notNull().default(true),
		photoUrl: varchar('photo_url', { length: 500 }),
		photoAlt: varchar('photo_alt', { length: 200 }),
		photoZoom: integer('photo_zoom').default(100),
		layoutConfig: jsonb('layout_config'),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [check('hero_singleton', sql`${table.id} = 1`)]
);

export const aboutSection = pgTable(
	'about_section',
	{
		id: smallint('id').primaryKey().default(1),
		content: text('content').notNull(),
		imagePath: varchar('image_path', { length: 500 }),
		imageAlt: varchar('image_alt', { length: 200 }),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [check('about_singleton', sql`${table.id} = 1`)]
);

export const sectionHeaders = pgTable('section_headers', {
	sectionKey: varchar('section_key', { length: 50 }).primaryKey(),
	eyebrow: varchar('eyebrow', { length: 120 }),
	title: varchar('title', { length: 150 }),
	description: text('description'),
	isVisible: boolean('is_visible').notNull().default(true),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const footerSection = pgTable(
	'footer_section',
	{
		id: smallint('id').primaryKey().default(1),
		copyrightText: varchar('copyright_text', { length: 255 }),
		socialLinks: jsonb('social_links'),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [check('footer_singleton', sql`${table.id} = 1`)]
);

export const smtpSettings = pgTable(
	'smtp_settings',
	{
		id: smallint('id').primaryKey().default(1),
		host: varchar('host', { length: 255 }),
		port: integer('port').default(587),
		user: varchar('user', { length: 255 }),
		pass: text('pass'),
		fromName: varchar('from_name', { length: 255 }),
		fromEmail: varchar('from_email', { length: 255 }),
		targetEmail: varchar('target_email', { length: 255 }),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [check('smtp_singleton', sql`${table.id} = 1`)]
);

// ─── Ordered content items ───────────────────────────────────────────

export const whatICanDoItems = pgTable(
	'what_i_can_do_items',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		title: varchar('title', { length: 100 }).notNull(),
		description: varchar('description', { length: 255 }).notNull(),
		icon: varchar('icon', { length: 100 }),
		displayOrder: integer('display_order').notNull().default(0),
		isVisible: boolean('is_visible').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('what_i_can_do_display_order_idx').on(table.displayOrder)]
);

export const skills = pgTable(
	'skills',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 60 }).notNull(),
		icon: varchar('icon', { length: 100 }),
		category: varchar('category', { length: 60 }),
		proficiency: smallint('proficiency'),
		displayOrder: integer('display_order').notNull().default(0),
		isVisible: boolean('is_visible').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('skills_display_order_idx').on(table.displayOrder),
		index('skills_category_idx').on(table.category),
		check(
			'skills_proficiency_check',
			sql`${table.proficiency} >= 0 AND ${table.proficiency} <= 100`
		)
	]
);

// ─── Work items ──────────────────────────────────────────────────────

export const workItems = pgTable(
	'work_items',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: varchar('slug', { length: 160 }).notNull().unique(),
		title: varchar('title', { length: 150 }).notNull(),
		shortDescription: varchar('short_description', { length: 255 }).notNull(),
		longDescription: text('long_description').notNull(),
		coverImageUrl: varchar('cover_image_url', { length: 500 }).notNull(),
		coverImageAlt: varchar('cover_image_alt', { length: 200 }),
		projectUrl: varchar('project_url', { length: 255 }),
		repoUrl: varchar('repo_url', { length: 255 }),
		isPinned: boolean('is_pinned').notNull().default(false),
		pinnedOrder: smallint('pinned_order'),
		isVisible: boolean('is_visible').notNull().default(true),
		displayOrder: integer('display_order').notNull().default(0),
		techStack: text('tech_stack').array(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('work_items_visible_pinned_idx').on(table.isVisible, table.isPinned),
		index('work_items_display_order_idx').on(table.displayOrder)
	]
);

export const workImages = pgTable(
	'work_images',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		workItemId: uuid('work_item_id')
			.notNull()
			.references(() => workItems.id, { onDelete: 'cascade' }),
		imageUrl: varchar('image_url', { length: 500 }).notNull(),
		imageAlt: varchar('image_alt', { length: 200 }),
		displayOrder: integer('display_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('work_images_work_item_order_idx').on(table.workItemId, table.displayOrder)]
);

// ─── Contact messages ────────────────────────────────────────────────

export const contactMessages = pgTable(
	'contact_messages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 150 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		message: text('message').notNull(),
		ipAddress: varchar('ip_address', { length: 64 }),
		isRead: boolean('is_read').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('contact_messages_read_created_idx').on(table.isRead, table.createdAt)]
);

// ─── Visitor analytics ───────────────────────────────────────────────

export const visitorLogs = pgTable(
	'visitor_logs',
	{
		id: bigserial('id', { mode: 'number' }).primaryKey(),
		path: varchar('path', { length: 255 }).notNull(),
		ipHash: varchar('ip_hash', { length: 128 }),
		visitorId: varchar('visitor_id', { length: 128 }),
		userAgent: varchar('user_agent', { length: 255 }),
		visitedAt: timestamp('visited_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('visitor_logs_visited_at_idx').on(table.visitedAt),
		index('visitor_logs_path_visited_at_idx').on(table.path, table.visitedAt),
		index('visitor_logs_visitor_id_idx').on(table.visitorId)
	]
);

export const visitorDailyStats = pgTable('visitor_daily_stats', {
	date: date('date').primaryKey(),
	viewCount: integer('view_count').notNull().default(0),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const visitorMonthlyStats = pgTable('visitor_monthly_stats', {
	yearMonth: char('year_month', { length: 7 }).primaryKey(),
	viewCount: integer('view_count').notNull().default(0),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// ─── Security lockouts ───────────────────────────────────────────────

export const securityLockouts = pgTable(
	'security_lockouts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		identifier: varchar('identifier', { length: 255 }).notNull(),
		identifierType: varchar('identifier_type', { length: 20 }).notNull(),
		failedAttempts: integer('failed_attempts').notNull().default(0),
		lockedUntil: timestamp('locked_until', { withTimezone: true }),
		lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }).notNull().defaultNow(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('security_lockouts_identifier_idx').on(table.identifier, table.identifierType),
		check('security_lockouts_type_check', sql`${table.identifierType} IN ('ip', 'account')`)
	]
);

// ─── Relations ───────────────────────────────────────────────────────

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
	refreshTokens: many(refreshTokens)
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
	adminUser: one(adminUsers, {
		fields: [refreshTokens.adminUserId],
		references: [adminUsers.id]
	})
}));

export const workItemsRelations = relations(workItems, ({ many }) => ({
	images: many(workImages)
}));

export const workImagesRelations = relations(workImages, ({ one }) => ({
	workItem: one(workItems, {
		fields: [workImages.workItemId],
		references: [workItems.id]
	})
}));
