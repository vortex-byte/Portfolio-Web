import { resolve, dirname, normalize } from 'node:path';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
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

export class LocalStorageProvider implements IStorageProvider {
	resolveUploadPath(relativePath: string): string {
		if (!relativePath.startsWith('/uploads/')) {
			throw new Error('Invalid image path');
		}
		const uploadRoot = resolve(env.UPLOAD_DIR);
		const resolved = resolve(uploadRoot, relativePath.replace(/^\/uploads\//, ''));
		const normalizedRoot = normalize(uploadRoot);
		if (resolved !== normalizedRoot && !resolved.startsWith(normalizedRoot + '/')) {
			throw new Error('Image path escapes the uploads directory');
		}
		return resolved;
	}
	async saveImage(file: File, category: string): Promise<SavedFileResult> {
		if (!ALLOWED_MIME_TYPES.has(file.type)) {
			throw new Error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`);
		}

		const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
		if (file.size > maxBytes) {
			throw new Error(`File too large. Max size: ${env.MAX_UPLOAD_SIZE_MB}MB`);
		}

		const uploadRoot = resolve(env.UPLOAD_DIR);
		const dir = resolve(uploadRoot, category);
		await mkdir(dir, { recursive: true });

		const filename = `${generateUuid()}${MIME_TO_EXT[file.type] || '.webp'}`;
		const fullPath = resolve(dir, filename);
		const relativeUrl = `/uploads/${category}/${filename}`;

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		try {
			const sharp = (await import('sharp')).default;
			const reencoded = await sharp(buffer)
				.resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
				.webp({ quality: 80 })
				.toBuffer();

			await writeFile(fullPath, reencoded);

			const thumbPath = resolve(dir, `thumb_${filename}`);
			const thumbBuffer = await sharp(buffer)
				.resize({ width: 400, height: 300, fit: 'cover' })
				.webp({ quality: 75 })
				.toBuffer();
			await writeFile(thumbPath, thumbBuffer);
		} catch (sharpErr) {
			logger.warn({ err: sharpErr }, 'Sharp re-encoding failed, storing raw buffer');
			await writeFile(fullPath, buffer);
		}

		logger.info({ path: relativeUrl, size: file.size }, 'Image uploaded and processed');

		return {
			url: relativeUrl,
			fileName: filename
		};
	}

	async deleteImage(relativePath: string): Promise<void> {
		if (!relativePath || !relativePath.startsWith('/uploads/')) return;

		const uploadRoot = resolve(env.UPLOAD_DIR);
		const cleanRelative = relativePath.replace(/^\/uploads\//, '');
		const targetPath = resolve(uploadRoot, cleanRelative);

		if (!targetPath.startsWith(uploadRoot)) {
			logger.warn({ path: relativePath }, 'Path traversal attempt prevented during file deletion');
			return;
		}

		try {
			await unlink(targetPath);
			logger.info({ path: targetPath }, 'File deleted');
		} catch (err) {
			logger.warn({ err, path: targetPath }, 'Failed to delete file (may not exist)');
		}

		const dir = dirname(targetPath);
		const parts = targetPath.split(/[/\\]/);
		const filename = parts[parts.length - 1];
		const thumbPath = resolve(dir, `thumb_${filename}`);
		try {
			await unlink(thumbPath);
		} catch {
			// Thumbnail cleanup is best-effort
		}
	}
}

export const localStorageProvider = new LocalStorageProvider();
