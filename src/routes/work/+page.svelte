<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Card from '$lib/components/public/Card.svelte';
	import Badge from '$lib/components/public/Badge.svelte';
	import Button from '$lib/components/public/Button.svelte';
	import Icon from '$lib/components/public/Icon.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let items = $derived(data.workData.items);
	let page = $derived(data.workData.page);
	let totalPages = $derived(data.workData.totalPages);
</script>

<svelte:head>
	<title>All Work | {env.PUBLIC_SITE_TITLE || 'BuildWithZimam'}</title>
</svelte:head>

<section class="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
	<!-- Header -->
	<div class="flex flex-col gap-4">
		<a
			href="/"
			class="inline-flex w-fit items-center gap-2 text-sm font-bold text-black transition-colors hover:text-[#FF3EA5]"
		>
			<Icon name="ChevronLeft" size={18} />
			<span>Back to Home</span>
		</a>

		<div class="flex flex-col gap-2">
			<h1 class="text-4xl font-black tracking-tight text-black uppercase sm:text-5xl lg:text-6xl">
				All Work
			</h1>
			<p class="max-w-2xl text-lg font-medium text-neutral-700">
				Explore all completed web development projects, web applications, and side builds.
			</p>
		</div>
	</div>

	<!-- Work Items Grid -->
	{#if items.length > 0}
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each items as work (work.id)}
				<a href="/work/{work.slug}" class="group block text-left">
					<Card
						bg="bg-white"
						class="flex h-full flex-col gap-4 transition-all group-hover:-translate-y-1.5 group-hover:shadow-[6px_6px_0px_#000000]"
					>
						<!-- Thumbnail Frame -->
						<div
							class="aspect-video shrink-0 overflow-hidden rounded-[6px] border-[3px] border-black bg-neutral-100 shadow-[3px_3px_0px_#000000]"
						>
							<img
								src={work.coverImageUrl}
								alt={work.coverImageAlt || work.title}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								loading="lazy"
							/>
						</div>

						<!-- Details -->
						<div class="flex flex-1 flex-col gap-2">
							<h2
								class="text-xl font-black tracking-wide text-black uppercase transition-colors group-hover:text-[#FF3EA5]"
							>
								{work.title}
							</h2>
							<p class="line-clamp-3 text-sm leading-relaxed font-medium text-neutral-700">
								{work.shortDescription}
							</p>
						</div>

						<!-- Tech Stack Badges -->
						{#if work.techStack && work.techStack.length > 0}
							<div class="flex flex-wrap gap-1.5 border-t-2 border-neutral-200 pt-2">
								{#each work.techStack as tag (tag)}
									<Badge variant="default" class="text-[10px]">{tag}</Badge>
								{/each}
							</div>
						{/if}
					</Card>
				</a>
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-center gap-4 pt-6">
				{#if page > 1}
					<Button href="/work?page={page - 1}" variant="outline" size="sm">
						<Icon name="ChevronLeft" size={18} />
						<span>Previous</span>
					</Button>
				{/if}

				<span class="rounded-[4px] bg-black px-3 py-1 font-mono text-sm font-bold text-white">
					Page {page} of {totalPages}
				</span>

				{#if page < totalPages}
					<Button href="/work?page={page + 1}" variant="outline" size="sm">
						<span>Next</span>
						<Icon name="ChevronRight" size={18} />
					</Button>
				{/if}
			</div>
		{/if}
	{:else}
		<Card bg="bg-white" class="flex flex-col items-center gap-4 p-12 text-center">
			<Icon name="FolderOpen" size={48} class="text-neutral-400" />
			<h3 class="text-xl font-black uppercase">No Work Items Found</h3>
			<p class="font-medium text-neutral-600">Check back soon for new project showcases.</p>
		</Card>
	{/if}
</section>
