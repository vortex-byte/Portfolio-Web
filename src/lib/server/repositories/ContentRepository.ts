import { db } from '$lib/server/db';
import {
	heroSection,
	aboutSection,
	footerSection,
	sectionHeaders,
	whatICanDoItems,
	skills
} from '$lib/server/db/schema';
import { eq, asc, count, inArray, sql } from 'drizzle-orm';
import type {
	IContentRepository,
	UpsertHeroInput,
	UpsertAboutInput,
	UpsertFooterInput,
	UpsertSectionHeaderInput,
	CreateServiceInput,
	UpdateServiceInput,
	CreateSkillInput,
	UpdateSkillInput
} from './IContentRepository';
import type {
	HeroSectionEntity,
	AboutSectionEntity,
	FooterSectionEntity,
	ServiceItemEntity,
	SkillEntity,
	SectionHeaderEntity
} from '$lib/server/domain/interfaces/IContent';

export class ContentRepository implements IContentRepository {
	async getHero(): Promise<HeroSectionEntity | null> {
		const res = await db.select().from(heroSection).where(eq(heroSection.id, 1)).limit(1);
		return res[0] ?? null;
	}

	async upsertHero(input: UpsertHeroInput): Promise<HeroSectionEntity> {
		const showPhoto = input.showPhoto ?? true;
		const [res] = await db
			.insert(heroSection)
			.values({
				id: 1,
				title: input.title,
				description: input.description,
				ctaPrimaryLabel: input.ctaPrimaryLabel,
				ctaPrimaryUrl: input.ctaPrimaryUrl,
				ctaSecondaryLabel: input.ctaSecondaryLabel,
				ctaSecondaryUrl: input.ctaSecondaryUrl,
				showPhoto,
				photoUrl: input.photoUrl,
				photoAlt: input.photoAlt,
				photoZoom: input.photoZoom ?? 100,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: heroSection.id,
				set: {
					title: input.title,
					description: input.description,
					ctaPrimaryLabel: input.ctaPrimaryLabel,
					ctaPrimaryUrl: input.ctaPrimaryUrl,
					ctaSecondaryLabel: input.ctaSecondaryLabel,
					ctaSecondaryUrl: input.ctaSecondaryUrl,
					showPhoto,
					photoUrl: input.photoUrl,
					photoAlt: input.photoAlt,
					photoZoom: input.photoZoom ?? 100,
					updatedAt: new Date()
				}
			})
			.returning();

		return res;
	}

	async getAbout(): Promise<AboutSectionEntity | null> {
		const res = await db.select().from(aboutSection).where(eq(aboutSection.id, 1)).limit(1);
		return res[0] ?? null;
	}

	async upsertAbout(input: UpsertAboutInput): Promise<AboutSectionEntity> {
		const [res] = await db
			.insert(aboutSection)
			.values({
				id: 1,
				content: input.content,
				imagePath: input.imagePath,
				imageAlt: input.imageAlt,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: aboutSection.id,
				set: {
					content: input.content,
					imagePath: input.imagePath,
					imageAlt: input.imageAlt,
					updatedAt: new Date()
				}
			})
			.returning();

		return res;
	}

	async getSectionHeader(sectionKey: string): Promise<SectionHeaderEntity | null> {
		const res = await db
			.select()
			.from(sectionHeaders)
			.where(eq(sectionHeaders.sectionKey, sectionKey))
			.limit(1);
		return res[0] ?? null;
	}

	async getAllSectionHeaders(): Promise<Record<string, SectionHeaderEntity>> {
		const rows = await db.select().from(sectionHeaders);
		const map: Record<string, SectionHeaderEntity> = {};
		for (const row of rows) {
			map[row.sectionKey] = row;
		}
		return map;
	}

	async upsertSectionHeader(input: UpsertSectionHeaderInput): Promise<SectionHeaderEntity> {
		const isVisible = input.isVisible ?? true;
		const [res] = await db
			.insert(sectionHeaders)
			.values({
				sectionKey: input.sectionKey,
				eyebrow: input.eyebrow,
				title: input.title,
				description: input.description,
				isVisible,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: sectionHeaders.sectionKey,
				set: {
					eyebrow: input.eyebrow,
					title: input.title,
					description: input.description,
					isVisible,
					updatedAt: new Date()
				}
			})
			.returning();

		return res;
	}

	async getFooter(): Promise<FooterSectionEntity | null> {
		const res = await db.select().from(footerSection).where(eq(footerSection.id, 1)).limit(1);
		return res[0] ?? null;
	}

	async upsertFooter(input: UpsertFooterInput): Promise<FooterSectionEntity> {
		const [res] = await db
			.insert(footerSection)
			.values({
				id: 1,
				copyrightText: input.copyrightText,
				socialLinks: input.socialLinks,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: footerSection.id,
				set: {
					copyrightText: input.copyrightText,
					socialLinks: input.socialLinks,
					updatedAt: new Date()
				}
			})
			.returning();

		return res;
	}

	async getServices(onlyVisible = false): Promise<ServiceItemEntity[]> {
		const query = db.select().from(whatICanDoItems);
		if (onlyVisible) {
			return query
				.where(eq(whatICanDoItems.isVisible, true))
				.orderBy(asc(whatICanDoItems.displayOrder));
		}
		return query.orderBy(asc(whatICanDoItems.displayOrder));
	}

	async getServiceCount(): Promise<number> {
		const [{ value }] = await db.select({ value: count() }).from(whatICanDoItems);
		return value;
	}

	async createService(input: CreateServiceInput): Promise<ServiceItemEntity> {
		const existing = await this.getServices();
		const maxOrder = existing.length > 0 ? Math.max(...existing.map((s) => s.displayOrder)) : -1;

		const [res] = await db
			.insert(whatICanDoItems)
			.values({
				title: input.title,
				description: input.description,
				icon: input.icon || null,
				displayOrder: maxOrder + 1,
				isVisible: true
			})
			.returning();

		return res;
	}

	async updateService(input: UpdateServiceInput): Promise<ServiceItemEntity> {
		const [res] = await db
			.update(whatICanDoItems)
			.set({
				title: input.title,
				description: input.description,
				icon: input.icon || null,
				updatedAt: new Date()
			})
			.where(eq(whatICanDoItems.id, input.id))
			.returning();

		return res;
	}

	async deleteService(id: string): Promise<void> {
		await db.delete(whatICanDoItems).where(eq(whatICanDoItems.id, id));
	}

	async reorderService(id: string, direction: 'up' | 'down'): Promise<void> {
		const items = await this.getServices();
		const idx = items.findIndex((i) => i.id === id);
		if (idx === -1) return;

		const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= items.length) return;

		const current = items[idx];
		const target = items[targetIdx];

		await db
			.update(whatICanDoItems)
			.set({
				displayOrder: sql`CASE 
					WHEN ${whatICanDoItems.id} = ${current.id} THEN ${target.displayOrder}
					WHEN ${whatICanDoItems.id} = ${target.id} THEN ${current.displayOrder}
					ELSE ${whatICanDoItems.displayOrder}
				END`
			})
			.where(inArray(whatICanDoItems.id, [current.id, target.id]));
	}

	async toggleServiceVisibility(id: string, isVisible: boolean): Promise<void> {
		await db
			.update(whatICanDoItems)
			.set({ isVisible, updatedAt: new Date() })
			.where(eq(whatICanDoItems.id, id));
	}

	async getSkills(onlyVisible = false): Promise<SkillEntity[]> {
		const query = db.select().from(skills);
		if (onlyVisible) {
			return query.where(eq(skills.isVisible, true)).orderBy(asc(skills.displayOrder));
		}
		return query.orderBy(asc(skills.displayOrder));
	}

	async getSkillCount(): Promise<number> {
		const [{ value }] = await db.select({ value: count() }).from(skills);
		return value;
	}

	async createSkill(input: CreateSkillInput): Promise<SkillEntity> {
		const existing = await this.getSkills();
		const maxOrder = existing.length > 0 ? Math.max(...existing.map((s) => s.displayOrder)) : -1;

		const [res] = await db
			.insert(skills)
			.values({
				name: input.name,
				icon: input.icon || null,
				category: input.category || null,
				proficiency: input.proficiency ?? null,
				displayOrder: maxOrder + 1,
				isVisible: true
			})
			.returning();

		return res;
	}

	async updateSkill(input: UpdateSkillInput): Promise<SkillEntity> {
		const [res] = await db
			.update(skills)
			.set({
				name: input.name,
				icon: input.icon || null,
				category: input.category || null,
				proficiency: input.proficiency ?? null,
				updatedAt: new Date()
			})
			.where(eq(skills.id, input.id))
			.returning();

		return res;
	}

	async deleteSkill(id: string): Promise<void> {
		await db.delete(skills).where(eq(skills.id, id));
	}

	async reorderSkill(id: string, direction: 'up' | 'down'): Promise<void> {
		const items = await this.getSkills();
		const idx = items.findIndex((i) => i.id === id);
		if (idx === -1) return;

		const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= items.length) return;

		const current = items[idx];
		const target = items[targetIdx];

		await db
			.update(skills)
			.set({
				displayOrder: sql`CASE 
					WHEN ${skills.id} = ${current.id} THEN ${target.displayOrder}
					WHEN ${skills.id} = ${target.id} THEN ${current.displayOrder}
					ELSE ${skills.displayOrder}
				END`
			})
			.where(inArray(skills.id, [current.id, target.id]));
	}

	async toggleSkillVisibility(id: string, isVisible: boolean): Promise<void> {
		await db.update(skills).set({ isVisible, updatedAt: new Date() }).where(eq(skills.id, id));
	}
}

export const contentRepository = new ContentRepository();
