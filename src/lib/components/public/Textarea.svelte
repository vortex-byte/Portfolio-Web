<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = '',
		id = undefined,
		name = undefined,
		rows = 5,
		required = false,
		disabled = false,
		error = undefined,
		class: className = '',
		...restProps
	}: {
		value?: string;
		placeholder?: string;
		id?: string;
		name?: string;
		rows?: number;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<div class="flex w-full flex-col gap-1">
	<textarea
		{id}
		{name}
		{rows}
		{placeholder}
		{required}
		{disabled}
		bind:value
		class="w-full resize-y rounded-[6px] border-[3px] border-black bg-white px-4 py-2.5 font-medium text-black shadow-[3px_3px_0px_#000000] transition-all placeholder:text-neutral-500 focus:shadow-[4px_4px_0px_#000000] focus:ring-2 focus:ring-black focus:outline-none disabled:bg-neutral-100 disabled:opacity-50 {error
			? 'border-red-600'
			: ''} {className}"
		{...restProps}></textarea>
	{#if error}
		<span class="pl-1 text-xs font-bold text-red-600">{error}</span>
	{/if}
</div>
