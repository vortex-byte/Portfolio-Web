import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as icons from 'lucide-svelte';

const allIconNames = Object.keys(icons).filter(
	(key) => /^[A-Z]/.test(key) && key !== 'Icon' && key !== 'createLucideIcon'
);

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim().toLowerCase() || '';

	let results: string[];
	if (!q) {
		results = allIconNames.slice(0, 30);
	} else {
		results = allIconNames.filter((name) => name.toLowerCase().includes(q)).slice(0, 30);
	}

	return json({ icons: results });
};
