import * as icons from 'lucide-svelte';

export function isValidIcon(name: string | null | undefined): boolean {
	if (!name) return false;
	const normalized = name.charAt(0).toUpperCase() + name.slice(1);
	return Object.prototype.hasOwnProperty.call(icons, normalized);
}
