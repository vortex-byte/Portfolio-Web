import { contentService } from '$lib/server/container';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const footer = await contentService.getFooter();
	return {
		footer
	};
};
