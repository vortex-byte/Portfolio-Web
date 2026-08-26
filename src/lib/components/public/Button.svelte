<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'outline' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	let {
		variant = 'primary',
		size = 'md',
		href = undefined,
		type = 'button',
		disabled = false,
		class: className = '',
		children,
		onclick,
		...restProps
	}: {
		variant?: Variant;
		size?: Size;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		[key: string]: unknown;
	} = $props();

	const variantStyles: Record<Variant, string> = {
		primary: 'bg-[#FFD60A] text-black hover:bg-[#ffe14d]',
		secondary: 'bg-[#FF3EA5] text-white hover:bg-[#ff63b8]',
		outline: 'bg-[#FFF9EC] text-black hover:bg-white',
		danger: 'bg-[#FF4D4D] text-white hover:bg-[#ff6666]'
	};

	const sizeStyles: Record<Size, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-5 py-2.5 text-base font-semibold',
		lg: 'px-7 py-3.5 text-lg font-bold'
	};

	const baseStyles =
		'inline-flex items-center justify-center gap-2 border-[3px] border-black rounded-[6px] shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_#000000]';
</script>

{#if href}
	<a
		{href}
		class="{baseStyles} {variantStyles[variant]} {sizeStyles[size]} {className}"
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		{onclick}
		class="{baseStyles} {variantStyles[variant]} {sizeStyles[size]} {className}"
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
