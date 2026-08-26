<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		hoverable = true,
		bg = 'bg-[#FFF9EC]',
		children,
		...restProps
	}: {
		class?: string;
		hoverable?: boolean;
		bg?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<div
	class="rounded-[6px] border-[3px] border-black p-6 shadow-[4px_4px_0px_#000000] {bg} {hoverable
		? 'transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000000]'
		: ''} {className}"
	{...restProps}
>
	{@render children?.()}
</div>
