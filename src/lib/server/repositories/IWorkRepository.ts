import type {
	WorkItemEntity,
	WorkImageEntity,
	WorkItemWithImagesEntity,
	WorkListingResult
} from '$lib/server/domain/interfaces/IWork';

export interface CreateWorkInput {
	title: string;
	shortDescription: string;
	longDescription: string;
	coverImageUrl: string;
	coverImageAlt?: string | null;
	projectUrl?: string | null;
	repoUrl?: string | null;
	techStack?: string[];
}

export interface UpdateWorkInput extends CreateWorkInput {
	id: string;
}

export interface IWorkRepository {
	getListing(page?: number, pageSize?: number, onlyVisible?: boolean): Promise<WorkListingResult>;
	getAllForAdmin(): Promise<WorkItemEntity[]>;
	getWorkCount(): Promise<number>;
	getBySlug(slug: string): Promise<WorkItemWithImagesEntity | null>;
	getById(id: string): Promise<WorkItemWithImagesEntity | null>;
	getPinned(limit?: number): Promise<WorkItemEntity[]>;
	createWork(input: CreateWorkInput): Promise<WorkItemEntity>;
	updateWork(input: UpdateWorkInput): Promise<WorkItemEntity>;
	deleteWork(id: string): Promise<string[]>;
	togglePin(id: string, isPinned: boolean): Promise<void>;
	reorderPinned(id: string, direction: 'up' | 'down'): Promise<void>;
	toggleVisibility(id: string, isVisible: boolean): Promise<void>;
	reorderWork(id: string, direction: 'up' | 'down'): Promise<void>;
	addGalleryImage(
		workItemId: string,
		imageUrl: string,
		imageAlt?: string | null
	): Promise<WorkImageEntity>;
	deleteGalleryImage(imageId: string): Promise<string | null>;
}
