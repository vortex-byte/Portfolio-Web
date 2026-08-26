export interface SavedFileResult {
	url: string;
	fileName: string;
}

export interface IStorageProvider {
	saveImage(file: File, category: string): Promise<SavedFileResult>;
	deleteImage(relativePath: string): Promise<void>;
	resolveUploadPath(relativePath: string): string;
}
