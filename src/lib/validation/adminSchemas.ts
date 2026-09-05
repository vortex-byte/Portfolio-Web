import { z } from 'zod';
import { isValidIcon } from './iconList';

const nonEmptyTrimmed = (field: string, max: number) =>
	z
		.string()
		.trim()
		.min(1, `${field} is required`)
		.max(max, `${field} must be under ${max} characters`);

const optionalUrl = z
	.union([z.string().trim().max(500), z.null(), z.undefined()])
	.transform((v) => (v ? v : undefined))
	.refine((v) => v === undefined || /^(https?:\/\/|\/)/.test(v), {
		message: 'Must be a valid http(s) or relative URL'
	});

const nullableString = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullable()
		.optional()
		.transform((v) => (v ? v : null));

export const heroSchema = z.object({
	title: nonEmptyTrimmed('Title', 120),
	description: nonEmptyTrimmed('Description', 2000),
	ctaPrimaryLabel: nullableString(60),
	ctaPrimaryUrl: optionalUrl,
	ctaSecondaryLabel: nullableString(60),
	ctaSecondaryUrl: optionalUrl,
	showPhoto: z.boolean().default(true),
	photoPath: nullableString(500),
	photoAlt: nullableString(200),
	photoZoom: z.coerce
		.number()
		.int()
		.min(50, 'Zoom must be between 50% and 200%')
		.max(200, 'Zoom must be between 50% and 200%')
		.optional()
		.default(100)
});

export const aboutSchema = z.object({
	content: z.string().min(1, 'Content is required'),
	imagePath: nullableString(500),
	imageAlt: nullableString(200)
});

export const sectionHeaderSchema = z.object({
	sectionKey: z.string().min(1, 'Section key is required').max(50),
	eyebrow: nullableString(120),
	title: nullableString(150),
	description: nullableString(2000),
	isVisible: z.boolean().default(true)
});

export const footerSchema = z.object({
	copyrightText: nullableString(255),
	socialLinks: z
		.array(
			z.object({
				platform: nonEmptyTrimmed('Platform', 60),
				url: z.string().trim().max(500),
				icon: z
					.string()
					.trim()
					.refine((v) => isValidIcon(v), 'Invalid Lucide icon name')
			})
		)
		.max(20)
		.optional()
		.nullable()
});

export const serviceItemSchema = z.object({
	id: z.string().uuid().optional(),
	title: nonEmptyTrimmed('Title', 100),
	description: nonEmptyTrimmed('Description', 255),
	icon: z
		.string()
		.default('PanelsTopLeft')
		.refine((v) => isValidIcon(v), 'Invalid Lucide icon name')
});

export const skillSchema = z.object({
	id: z.string().uuid().optional(),
	name: nonEmptyTrimmed('Skill name', 60),
	icon: z
		.string()
		.optional()
		.transform((v) => (v ? v : null)),
	category: nullableString(60),
	proficiency: z.coerce
		.number()
		.int()
		.min(0, 'Proficiency must be between 0 and 100')
		.max(100, 'Proficiency must be between 0 and 100')
		.nullable()
		.optional()
});

export const workItemSchema = z.object({
	title: nonEmptyTrimmed('Title', 150),
	shortDescription: nonEmptyTrimmed('Short description', 255),
	longDescription: z.string().min(1, 'Long description is required'),
	coverImagePath: z.string().trim().min(1, 'Cover image is required').max(500),
	coverImageAlt: nullableString(200),
	projectUrl: optionalUrl,
	repoUrl: optionalUrl,
	techStack: z.array(z.string().trim().min(1).max(50)).max(20).optional()
});

export const updateProfileSchema = z
	.object({
		name: nonEmptyTrimmed('Name', 150),
		email: z.string().trim().email('Invalid email address format'),
		currentPassword: z.string().optional().or(z.literal('')),
		newPassword: z.string().optional().or(z.literal('')),
		confirmPassword: z.string().optional().or(z.literal(''))
	})
	.refine(
		(data) => {
			if (data.newPassword && data.newPassword.length < 8) {
				return false;
			}
			return true;
		},
		{
			message: 'New password must be at least 8 characters long',
			path: ['newPassword']
		}
	)
	.refine(
		(data) => {
			if (data.newPassword && data.newPassword !== data.confirmPassword) {
				return false;
			}
			return true;
		},
		{
			message: 'Passwords do not match',
			path: ['confirmPassword']
		}
	);

export type HeroInput = z.infer<typeof heroSchema>;
export type AboutInput = z.infer<typeof aboutSchema>;
export type SectionHeaderInput = z.infer<typeof sectionHeaderSchema>;
export type FooterInput = z.infer<typeof footerSchema>;
export type ServiceItemInput = z.infer<typeof serviceItemSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type WorkItemInput = z.infer<typeof workItemSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
