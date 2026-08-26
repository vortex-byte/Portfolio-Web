import type { IContentRepository } from '$lib/server/repositories/IContentRepository';
import type { ICacheService } from '$lib/server/cache/ICacheService';
import type {
	HeroSectionEntity,
	AboutSectionEntity,
	FooterSectionEntity,
	ServiceItemEntity,
	SkillEntity,
	SectionHeaderEntity
} from '$lib/server/domain/interfaces/IContent';
import type {
	UpsertHeroInput,
	UpsertAboutInput,
	UpsertFooterInput,
	UpsertSectionHeaderInput,
	CreateServiceInput,
	UpdateServiceInput,
	CreateSkillInput,
	UpdateSkillInput
} from '$lib/server/repositories/IContentRepository';

export class ContentService {
	constructor(
		private contentRepo: IContentRepository,
		private cacheService: ICacheService
	) {}

	async getHero(): Promise<HeroSectionEntity | null> {
		return this.cacheService.getOrSet('content:hero', 3600, async () => {
			return this.contentRepo.getHero();
		});
	}

	async saveHero(input: UpsertHeroInput): Promise<HeroSectionEntity> {
		const res = await this.contentRepo.upsertHero(input);
		await this.cacheService.delete('content:hero');
		return res;
	}

	async getAbout(): Promise<AboutSectionEntity | null> {
		return this.cacheService.getOrSet('content:about', 3600, async () => {
			return this.contentRepo.getAbout();
		});
	}

	async saveAbout(input: UpsertAboutInput): Promise<AboutSectionEntity> {
		const res = await this.contentRepo.upsertAbout(input);
		await this.cacheService.delete('content:about');
		return res;
	}

	async getServices(onlyVisible = true): Promise<ServiceItemEntity[]> {
		if (!onlyVisible) {
			return this.contentRepo.getServices(false);
		}
		return this.cacheService.getOrSet('content:services', 3600, async () => {
			return this.contentRepo.getServices(true);
		});
	}

	async createService(input: CreateServiceInput): Promise<ServiceItemEntity> {
		const res = await this.contentRepo.createService(input);
		await this.cacheService.delete('content:services');
		return res;
	}

	async updateService(input: UpdateServiceInput): Promise<ServiceItemEntity> {
		const res = await this.contentRepo.updateService(input);
		await this.cacheService.delete('content:services');
		return res;
	}

	async deleteService(id: string): Promise<void> {
		await this.contentRepo.deleteService(id);
		await this.cacheService.delete('content:services');
	}

	async reorderService(id: string, direction: 'up' | 'down'): Promise<void> {
		await this.contentRepo.reorderService(id, direction);
		await this.cacheService.delete('content:services');
	}

	async toggleServiceVisibility(id: string, isVisible: boolean): Promise<void> {
		await this.contentRepo.toggleServiceVisibility(id, isVisible);
		await this.cacheService.delete('content:services');
	}

	async getSkills(onlyVisible = true): Promise<SkillEntity[]> {
		if (!onlyVisible) {
			return this.contentRepo.getSkills(false);
		}
		return this.cacheService.getOrSet('content:skills', 3600, async () => {
			return this.contentRepo.getSkills(true);
		});
	}

	async createSkill(input: CreateSkillInput): Promise<SkillEntity> {
		const res = await this.contentRepo.createSkill(input);
		await this.cacheService.delete('content:skills');
		return res;
	}

	async updateSkill(input: UpdateSkillInput): Promise<SkillEntity> {
		const res = await this.contentRepo.updateSkill(input);
		await this.cacheService.delete('content:skills');
		return res;
	}

	async deleteSkill(id: string): Promise<void> {
		await this.contentRepo.deleteSkill(id);
		await this.cacheService.delete('content:skills');
	}

	async reorderSkill(id: string, direction: 'up' | 'down'): Promise<void> {
		await this.contentRepo.reorderSkill(id, direction);
		await this.cacheService.delete('content:skills');
	}

	async toggleSkillVisibility(id: string, isVisible: boolean): Promise<void> {
		await this.contentRepo.toggleSkillVisibility(id, isVisible);
		await this.cacheService.delete('content:skills');
	}

	async getSectionHeader(sectionKey: string): Promise<SectionHeaderEntity | null> {
		const headers = await this.getSectionHeaders();
		return headers[sectionKey] ?? null;
	}

	async getSectionHeaders(): Promise<Record<string, SectionHeaderEntity>> {
		return this.cacheService.getOrSet('content:section_headers', 3600, async () => {
			return this.contentRepo.getAllSectionHeaders();
		});
	}

	async saveSectionHeader(input: UpsertSectionHeaderInput): Promise<SectionHeaderEntity> {
		const res = await this.contentRepo.upsertSectionHeader(input);
		await this.cacheService.delete('content:section_headers');
		return res;
	}

	async getFooter(): Promise<FooterSectionEntity | null> {
		return this.cacheService.getOrSet('content:footer', 3600, async () => {
			return this.contentRepo.getFooter();
		});
	}

	async saveFooter(input: UpsertFooterInput): Promise<FooterSectionEntity> {
		const res = await this.contentRepo.upsertFooter(input);
		await this.cacheService.delete('content:footer');
		return res;
	}
}
