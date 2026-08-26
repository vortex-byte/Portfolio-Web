<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		variant = 'info',
		title = undefined,
		class: className = '',
		children
	}: {
		variant?: 'success' | 'error' | 'info' | 'warning';
		title?: string;
		class?: string;
		children?: Snippet;
	} = $props();

	const variantStyles = {
		success: 'bg-[#7AE582] text-black border-black',
		error: 'bg-[#FF4D4D] text-white border-black',
		warning: 'bg-[#FFD60A] text-black border-black',
		info: 'bg-[#4EA8DE] text-white border-black'
	};

	const iconNames = {
		success: 'CircleCheck',
		error: 'CircleAlert',
		warning: 'AlertTriangle',
		info: 'Info'
	};
</script>

<div
	class="flex items-start gap-3 rounded-[6px] border-[3px] border-black p-4 shadow-[4px_4px_0px_#000000] {variantStyles[
		variant
	]} {className}"
	role="alert"
>
	<Icon name={iconNames[variant]} size={24} class="mt-0.5 shrink-0" />
	<div class="flex flex-col gap-1">
		{#if title}
			<h4 class="text-base font-bold tracking-wider uppercase">{title}</h4>
		{/if}
		<div class="text-sm font-medium">
			{@render children?.()}
		</div>
	</div>
</div>
