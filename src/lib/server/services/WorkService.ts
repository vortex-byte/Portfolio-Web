import type {
	IWorkRepository,
	CreateWorkInput,
	UpdateWorkInput
} from '$lib/server/repositories/IWorkRepository';
import type { ICacheService } from '$lib/server/cache/ICacheService';
import type { IStorageProvider } from '$lib/server/storage/IStorageProvider';
import type {
	WorkItemEntity,
	WorkImageEntity,
	WorkItemWithImagesEntity,
	WorkListingResult
} from '$lib/server/domain/interfaces/IWork';

export class WorkService {
	constructor(
		private workRepo: IWorkRepository,
		private cacheService: ICacheService,
		private storageProvider: IStorageProvider
	) {}

	async getWorkListing(page = 1, pageSize = 12): Promise<WorkListingResult> {
		const cacheKey = `content:work:list:${page}:${pageSize}`;
		return this.cacheService.getOrSet(cacheKey, 900, async () => {
			return this.workRepo.getListing(page, pageSize, true);
		});
	}

	async getAllForAdmin(): Promise<WorkItemEntity[]> {
		return this.workRepo.getAllForAdmin();
	}

	async getWorkBySlug(slug: string): Promise<WorkItemWithImagesEntity | null> {
		const cacheKey = `content:work:detail:${slug}`;
		return this.cacheService.getOrSet(cacheKey, 3600, async () => {
			return this.workRepo.getBySlug(slug);
		});
	}

	async getById(id: string): Promise<WorkItemWithImagesEntity | null> {
		return this.workRepo.getById(id);
	}

	async getPinnedWork(limit = 3): Promise<WorkItemEntity[]> {
		return this.cacheService.getOrSet('content:work:pinned', 1800, async () => {
			const pinned = await this.workRepo.getPinned(limit);
			if (pinned.length >= limit) return pinned;

			const extraNeeded = limit - pinned.length;
			const pinnedIds = new Set(pinned.map((p) => p.id));
			const listing = await this.workRepo.getListing(1, limit + pinned.length, true);
			const fallback = listing.items
				.filter((item) => !pinnedIds.has(item.id))
				.slice(0, extraNeeded);

			return [...pinned, ...fallback];
		});
	}

	async createWork(input: CreateWorkInput): Promise<WorkItemEntity> {
		const res = await this.workRepo.createWork(input);
		await this.cacheService.invalidatePattern('content:work:*');
		return res;
	}

	async updateWork(input: UpdateWorkInput): Promise<WorkItemEntity> {
		const existing = await this.workRepo.getById(input.id);
		const res = await this.workRepo.updateWork(input);

		if (existing && existing.coverImagePath !== input.coverImagePath) {
			await this.storageProvider.deleteImage(existing.coverImagePath);
		}

		await this.cacheService.invalidatePattern('content:work:*');
		return res;
	}

	async deleteWork(id: string): Promise<void> {
		const deletedImageUrls = await this.workRepo.deleteWork(id);
		for (const url of deletedImageUrls) {
			await this.storageProvider.deleteImage(url);
		}
		await this.cacheService.invalidatePattern('content:work:*');
	}

	async togglePin(id: string, isPinned: boolean): Promise<void> {
		await this.workRepo.togglePin(id, isPinned);
		await this.cacheService.invalidatePattern('content:work:*');
	}

	async reorderPinned(id: string, direction: 'up' | 'down'): Promise<void> {
		await this.workRepo.reorderPinned(id, direction);
		await this.cacheService.invalidatePattern('content:work:*');
	}

	async toggleVisibility(id: string, isVisible: boolean): Promise<void> {
		await this.workRepo.toggleVisibility(id, isVisible);
		await this.cacheService.invalidatePattern('content:work:*');
	}

	async reorderWork(id: string, direction: 'up' | 'down'): Promise<void> {
		await this.workRepo.reorderWork(id, direction);
		await this.cacheService.invalidatePattern('content:work:*');
	}

	async addGalleryImage(
		workItemId: string,
		imagePath: string,
		imageAlt?: string | null
	): Promise<WorkImageEntity> {
		const res = await this.workRepo.addGalleryImage(workItemId, imagePath, imageAlt);
		await this.cacheService.invalidatePattern('content:work:*');
		return res;
	}

	async deleteGalleryImage(imageId: string): Promise<void> {
		const deletedUrl = await this.workRepo.deleteGalleryImage(imageId);
		if (deletedUrl) {
			await this.storageProvider.deleteImage(deletedUrl);
		}
		await this.cacheService.invalidatePattern('content:work:*');
	}
}
