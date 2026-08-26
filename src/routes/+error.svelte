<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import Button from '$lib/components/public/Button.svelte';
	import Card from '$lib/components/public/Card.svelte';
	import Icon from '$lib/components/public/Icon.svelte';

	const debugMode = env.PUBLIC_DEBUG_MODE === 'true';
	const status = page.status || 500;

	const detailMessage = debugMode ? page.error?.message : '';
</script>

<svelte:head>
	<title>Error {status} | {env.PUBLIC_SITE_TITLE || 'BuildWithZimam'}</title>
</svelte:head>

<section class="flex min-h-[70vh] items-center justify-center bg-[#FFF9EC] p-6">
	<Card bg="bg-white" class="flex w-full max-w-md flex-col items-center gap-6 p-8 text-center">
		<div
			class="flex h-20 w-20 items-center justify-center rounded-[12px] border-[3px] border-black bg-[#FF3EA5] text-4xl font-black text-white shadow-[4px_4px_0px_#000]"
		>
			{status}
		</div>

		<div class="flex flex-col gap-2">
			<h1 class="text-2xl font-black tracking-tight text-black uppercase">
				{#if status === 404}
					Page Not Found
				{:else}
					Something Went Wrong
				{/if}
			</h1>
			{#if debugMode && detailMessage}
				<p class="font-mono text-sm break-words text-neutral-700">{detailMessage}</p>
			{/if}
		</div>

		<Button href="/" variant="primary" size="md" class="mt-2 w-full">
			<Icon name="Home" size={20} />
			<span>Return to Homepage</span>
		</Button>
	</Card>
</section>
