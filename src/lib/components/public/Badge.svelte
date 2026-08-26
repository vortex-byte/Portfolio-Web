<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		variant = 'default',
		children,
		...restProps
	}: {
		class?: string;
		variant?: 'default' | 'primary' | 'secondary' | 'info' | 'success';
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const variantStyles = {
		default: 'bg-white text-black',
		primary: 'bg-[#FFD60A] text-black',
		secondary: 'bg-[#FF3EA5] text-white',
		info: 'bg-[#4EA8DE] text-white',
		success: 'bg-[#7AE582] text-black'
	};
</script>

<span
	class="inline-flex items-center gap-1.5 rounded-[4px] border-2 border-black px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase shadow-[2px_2px_0px_#000000] {variantStyles[
		variant
	]} {className}"
	{...restProps}
>
	{@render children?.()}
</span>
