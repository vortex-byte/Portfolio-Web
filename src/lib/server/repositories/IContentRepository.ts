import type {
	HeroSectionEntity,
	AboutSectionEntity,
	FooterSectionEntity,
	ServiceItemEntity,
	SkillEntity,
	SectionHeaderEntity
} from '$lib/server/domain/interfaces/IContent';

export interface UpsertHeroInput {
	title: string;
	description: string;
	ctaPrimaryLabel?: string | null;
	ctaPrimaryUrl?: string | null;
	ctaSecondaryLabel?: string | null;
	ctaSecondaryUrl?: string | null;
	showPhoto?: boolean;
	photoUrl?: string | null;
	photoAlt?: string | null;
	photoZoom?: number | null;
}

export interface UpsertAboutInput {
	content: string;
	imagePath?: string | null;
	imageAlt?: string | null;
}

export interface UpsertSectionHeaderInput {
	sectionKey: string;
	eyebrow?: string | null;
	title?: string | null;
	description?: string | null;
	isVisible?: boolean;
}

export interface UpsertFooterInput {
	copyrightText?: string | null;
	socialLinks?: unknown;
}

export interface CreateServiceInput {
	title: string;
	description: string;
	icon?: string | null;
}

export interface UpdateServiceInput {
	id: string;
	title: string;
	description: string;
	icon?: string | null;
}

export interface CreateSkillInput {
	name: string;
	icon?: string | null;
	category?: string | null;
	proficiency?: number | null;
}

export interface UpdateSkillInput {
	id: string;
	name: string;
	icon?: string | null;
	category?: string | null;
	proficiency?: number | null;
}

export interface IContentRepository {
	getHero(): Promise<HeroSectionEntity | null>;
	upsertHero(input: UpsertHeroInput): Promise<HeroSectionEntity>;
	getAbout(): Promise<AboutSectionEntity | null>;
	upsertAbout(input: UpsertAboutInput): Promise<AboutSectionEntity>;
	getFooter(): Promise<FooterSectionEntity | null>;
	upsertFooter(input: UpsertFooterInput): Promise<FooterSectionEntity>;

	getSectionHeader(sectionKey: string): Promise<SectionHeaderEntity | null>;
	getAllSectionHeaders(): Promise<Record<string, SectionHeaderEntity>>;
	upsertSectionHeader(input: UpsertSectionHeaderInput): Promise<SectionHeaderEntity>;

	getServices(onlyVisible?: boolean): Promise<ServiceItemEntity[]>;
	getServiceCount(): Promise<number>;
	createService(input: CreateServiceInput): Promise<ServiceItemEntity>;
	updateService(input: UpdateServiceInput): Promise<ServiceItemEntity>;
	deleteService(id: string): Promise<void>;
	reorderService(id: string, direction: 'up' | 'down'): Promise<void>;
	toggleServiceVisibility(id: string, isVisible: boolean): Promise<void>;

	getSkills(onlyVisible?: boolean): Promise<SkillEntity[]>;
	getSkillCount(): Promise<number>;
	createSkill(input: CreateSkillInput): Promise<SkillEntity>;
	updateSkill(input: UpdateSkillInput): Promise<SkillEntity>;
	deleteSkill(id: string): Promise<void>;
	reorderSkill(id: string, direction: 'up' | 'down'): Promise<void>;
	toggleSkillVisibility(id: string, isVisible: boolean): Promise<void>;
}
