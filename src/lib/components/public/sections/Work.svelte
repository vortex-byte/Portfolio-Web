<script lang="ts">
	import Card from '../Card.svelte';
	import Badge from '../Badge.svelte';
	import Button from '../Button.svelte';
	import Icon from '../Icon.svelte';

	export interface WorkItem {
		id: string;
		slug: string;
		title: string;
		shortDescription: string;
		coverImage: string;
		coverImageAlt?: string | null;
		techStack?: string[] | null;
	}

	let {
		eyebrow = 'Featured Projects',
		title = 'My Work',
		items = []
	}: {
		eyebrow?: string | null;
		title?: string | null;
		items: WorkItem[];
	} = $props();
</script>

<section id="work" class="border-b-[4px] border-black bg-[#FFF9EC] px-4 py-20 sm:px-6 lg:px-8">
	<div class="mx-auto flex max-w-7xl flex-col gap-12">
		<div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
			<div class="flex flex-col gap-2">
				{#if eyebrow}
					<span
						class="inline-block w-fit rounded-[4px] border-2 border-black bg-[#FFD60A] px-3 py-1 text-xs font-black tracking-wider text-black uppercase shadow-[2px_2px_0px_#000]"
					>
						{eyebrow}
					</span>
				{/if}
				{#if title}
					<h2
						class="text-3xl font-black tracking-tight text-black uppercase sm:text-4xl lg:text-5xl"
					>
						{title}
					</h2>
				{/if}
			</div>

			<Button href="/work" variant="outline" size="md" class="w-fit">
				<span>View All Work</span>
				<Icon name="ArrowRight" size={18} />
			</Button>
		</div>

		{#if items.length > 0}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each items as work (work.id)}
					<a href="/work/{work.slug}" class="group block text-left">
						<Card
							bg="bg-white"
							class="flex h-full flex-col gap-4 transition-all group-hover:-translate-y-1.5 group-hover:shadow-[6px_6px_0px_#000000]"
						>
							<!-- Work Thumbnail Image Frame -->
							<div
								class="aspect-video shrink-0 overflow-hidden rounded-[6px] border-[3px] border-black bg-neutral-100 shadow-[3px_3px_0px_#000000]"
							>
								<img
									src={work.coverImage}
									alt={work.coverImageAlt || work.title}
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									loading="lazy"
								/>
							</div>

							<!-- Title & Short Description -->
							<div class="flex flex-1 flex-col gap-2">
								<h3
									class="text-xl font-black tracking-wide text-black uppercase transition-colors group-hover:text-[#FF3EA5]"
								>
									{work.title}
								</h3>
								<p class="line-clamp-3 text-sm leading-relaxed font-medium text-neutral-700">
									{work.shortDescription}
								</p>
							</div>

							<!-- Tech Stack Badges -->
							{#if work.techStack && work.techStack.length > 0}
								<div class="flex flex-wrap gap-1.5 border-t-2 border-neutral-200 pt-2">
									{#each work.techStack as tag (tag)}
										<Badge variant="default">{tag}</Badge>
									{/each}
								</div>
							{/if}
						</Card>
					</a>
				{/each}
			</div>
		{:else}
			<p class="font-medium text-neutral-500 italic">No pinned work items to display.</p>
		{/if}
	</div>
</section>
