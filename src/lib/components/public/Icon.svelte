<script lang="ts">
	import * as icons from 'lucide-svelte';

	let {
		name,
		size = 24,
		class: className = ''
	}: {
		name?: string | null;
		size?: number | string;
		class?: string;
	} = $props();

	function getIconComponent(iconName: string | null | undefined) {
		if (!iconName) return icons.CodeXml;
		const normalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
		const IconComp = (icons as Record<string, unknown>)[normalized] as typeof icons.CodeXml;
		return IconComp || icons.CodeXml;
	}

	let IconComponent = $derived(getIconComponent(name));
</script>

<IconComponent {size} class={className} />
