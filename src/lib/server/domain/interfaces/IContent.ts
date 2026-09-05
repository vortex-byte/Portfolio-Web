export interface HeroSectionEntity {
	id: number;
	title: string;
	description: string;
	ctaPrimaryLabel: string | null;
	ctaPrimaryUrl: string | null;
	ctaSecondaryLabel: string | null;
	ctaSecondaryUrl: string | null;
	showPhoto: boolean;
	photoPath: string | null;
	photoAlt: string | null;
	photoZoom: number | null;
	layoutConfig: unknown;
	updatedAt: Date;
}

export interface AboutSectionEntity {
	id: number;
	content: string;
	imagePath: string | null;
	imageAlt: string | null;
	updatedAt: Date;
}

export interface SectionHeaderEntity {
	sectionKey: string;
	eyebrow: string | null;
	title: string | null;
	description: string | null;
	isVisible: boolean;
	updatedAt: Date;
}

export interface FooterSectionEntity {
	id: number;
	copyrightText: string | null;
	socialLinks: unknown;
	updatedAt: Date;
}

export interface ServiceItemEntity {
	id: string;
	title: string;
	description: string;
	icon: string | null;
	displayOrder: number;
	isVisible: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface SkillEntity {
	id: string;
	name: string;
	icon: string | null;
	category: string | null;
	proficiency: number | null;
	displayOrder: number;
	isVisible: boolean;
	createdAt: Date;
	updatedAt: Date;
}
