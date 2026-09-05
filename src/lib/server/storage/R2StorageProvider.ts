import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$lib/server/env';
import { logger } from '$lib/server/logger';
import { generateUuid } from '$lib/server/utils';
import type { IStorageProvider, SavedFileResult } from './IStorageProvider';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MIME_TO_EXT: Record<string, string> = {
	'image/jpeg': '.webp',
	'image/png': '.webp',
	'image/webp': '.webp'
};

export class R2StorageProvider implements IStorageProvider {
	private s3Client: S3Client;
	private bucketName: string;
	private publicUrl: string;

	constructor() {
		const accountId = env.R2_ACCOUNT_ID;
		const accessKeyId = env.R2_ACCESS_KEY_ID;
		const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
		this.bucketName = env.R2_BUCKET_NAME || '';
		this.publicUrl = (env.R2_PUBLIC_URL || '').replace(/\/$/, '');

		if (!accountId || !accessKeyId || !secretAccessKey || !this.bucketName) {
			throw new Error('R2StorageProvider missing required environment variables');
		}

		this.s3Client = new S3Client({
			region: 'auto',
			endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		});
	}

	resolveUploadPath(relativePath: string): string {
		return relativePath;
	}

	async saveImage(file: File, category: string): Promise<SavedFileResult> {
		if (!ALLOWED_MIME_TYPES.has(file.type)) {
			throw new Error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`);
		}

		const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
		if (file.size > maxBytes) {
			throw new Error(`File too large. Max size: ${env.MAX_UPLOAD_SIZE_MB}MB`);
		}

		const safeCategory = category.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		let mainBuffer = buffer;
		let thumbBuffer: Buffer | null = null;
		let extension = '.webp';
		let contentType = 'image/webp';

		try {
			const sharp = (await import('sharp')).default;
			mainBuffer = await sharp(buffer)
				.resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
				.webp({ quality: 80 })
				.toBuffer();

			thumbBuffer = await sharp(buffer)
				.resize({ width: 400, height: 300, fit: 'cover' })
				.webp({ quality: 75 })
				.toBuffer();
		} catch (sharpErr) {
			logger.warn({ err: sharpErr }, 'Sharp re-encoding failed, using raw upload buffer');
			contentType = file.type;
			extension = file.type === 'image/png' ? '.png' : file.type === 'image/jpeg' ? '.jpg' : '.webp';
		}

		const filename = `${generateUuid()}${extension}`;
		const key = `${safeCategory}/${filename}`;
		const thumbKey = `${safeCategory}/thumb_${filename}`;

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: mainBuffer,
				ContentType: contentType
			})
		);

		if (thumbBuffer) {
			try {
				await this.s3Client.send(
					new PutObjectCommand({
						Bucket: this.bucketName,
						Key: thumbKey,
						Body: thumbBuffer,
						ContentType: 'image/webp'
					})
				);
			} catch (err) {
				logger.warn({ err }, 'Failed to upload thumbnail to R2');
			}
		}

		const fullUrl = this.publicUrl ? `${this.publicUrl}/${key}` : `/${key}`;
		logger.info({ key, size: file.size, url: fullUrl }, 'Image uploaded to Cloudflare R2');

		return {
			url: fullUrl,
			fileName: filename
		};
	}

	async deleteImage(relativePath: string): Promise<void> {
		if (!relativePath) return;

		let key = relativePath;
		if (this.publicUrl && relativePath.startsWith(this.publicUrl)) {
			key = relativePath.slice(this.publicUrl.length).replace(/^\//, '');
		} else {
			key = relativePath.replace(/^\/uploads\//, '').replace(/^\//, '');
		}

		try {
			await this.s3Client.send(
				new DeleteObjectCommand({
					Bucket: this.bucketName,
					Key: key
				})
			);
			logger.info({ key }, 'Deleted file from Cloudflare R2');
		} catch (err) {
			logger.warn({ err, key }, 'Failed to delete file from R2');
		}

		const parts = key.split('/');
		if (parts.length > 1) {
			const filename = parts.pop();
			const category = parts.join('/');
			const thumbKey = `${category}/thumb_${filename}`;
			try {
				await this.s3Client.send(
					new DeleteObjectCommand({
						Bucket: this.bucketName,
						Key: thumbKey
					})
				);
			} catch {
				// Thumbnail cleanup is best-effort
			}
		}
	}
}
