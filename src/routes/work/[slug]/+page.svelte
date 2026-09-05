<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Carousel, { type CarouselImage } from '$lib/components/public/Carousel.svelte';
	import Card from '$lib/components/public/Card.svelte';
	import Badge from '$lib/components/public/Badge.svelte';
	import Button from '$lib/components/public/Button.svelte';
	import Icon from '$lib/components/public/Icon.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let work = $derived(data.work);

	let carouselImages = $derived.by(() => {
		const list: CarouselImage[] = [
			{ image: work.coverImagePath, imageAlt: work.coverImageAlt || work.title }
		];
		if (work.images && work.images.length > 0) {
			for (const img of work.images) {
				list.push({ id: img.id, image: img.imagePath, imageAlt: img.imageAlt });
			}
		}
		return list;
	});
</script>

<svelte:head>
	<title>{work.title} | {env.PUBLIC_SITE_TITLE || 'BuildWithZimam'}</title>
</svelte:head>

<section class="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 md:py-20 lg:px-8">
	<!-- Navigation -->
	<div class="flex items-center justify-between">
		<a
			href="/"
			class="inline-flex items-center gap-2 text-sm font-bold text-black transition-colors hover:text-[#FF3EA5]"
		>
			<Icon name="ArrowLeft" size={18} />
			<span>Back to Home</span>
		</a>

		<a
			href="/work"
			class="inline-flex items-center gap-2 text-sm font-bold text-black transition-colors hover:text-[#FF3EA5]"
		>
			<span>See All My Work</span>
			<Icon name="ArrowRight" size={18} />
		</a>
	</div>

	<!-- Title & Badges -->
	<div class="flex flex-col gap-4">
		<h1 class="text-4xl font-black tracking-tight text-black uppercase sm:text-5xl">
			{work.title}
		</h1>

		{#if work.techStack && work.techStack.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each work.techStack as tag (tag)}
					<Badge variant="primary" class="px-3 py-1 text-xs">{tag}</Badge>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Image Gallery Carousel -->
	<Carousel images={carouselImages} />

	<!-- Project / Repo External Links -->
	{#if work.projectUrl || work.repoUrl}
		<div class="flex flex-wrap gap-4 pt-2">
			{#if work.projectUrl}
				<Button href={work.projectUrl} target="_blank" rel="noopener noreferrer" variant="primary">
					<Icon name="ExternalLink" size={20} />
					<span>Live Demo</span>
				</Button>
			{/if}

			{#if work.repoUrl}
				<Button href={work.repoUrl} target="_blank" rel="noopener noreferrer" variant="outline">
					<Icon name="Github" size={20} />
					<span>Repository</span>
				</Button>
			{/if}
		</div>
	{/if}

	<!-- Long Description (Sanitized HTML) -->
	<Card bg="bg-white" class="p-8">
		<div
			class="prose prose-lg prose-p:font-medium prose-p:text-neutral-900 prose-headings:font-black prose-headings:uppercase prose-a:text-[#FF3EA5] prose-a:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-4 [&_blockquote]:italic max-w-none"
		>
			{@html work.longDescription}
		</div>
	</Card>
</section>
