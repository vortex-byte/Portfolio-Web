export interface WorkItemEntity {
	id: string;
	slug: string;
	title: string;
	shortDescription: string;
	longDescription: string;
	coverImagePath: string;
	coverImageAlt: string | null;
	projectUrl: string | null;
	repoUrl: string | null;
	isPinned: boolean;
	pinnedOrder: number | null;
	isVisible: boolean;
	displayOrder: number;
	techStack: string[] | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkImageEntity {
	id: string;
	workItemId: string;
	imagePath: string;
	imageAlt: string | null;
	displayOrder: number;
	createdAt: Date;
}

export interface WorkItemWithImagesEntity extends WorkItemEntity {
	images: WorkImageEntity[];
}

export interface WorkListingResult {
	items: WorkItemEntity[];
	totalCount: number;
	totalPages: number;
	page: number;
	pageSize: number;
}
