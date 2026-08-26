<script lang="ts">
	import Card from '../Card.svelte';
	import Icon from '../Icon.svelte';

	interface ServiceItem {
		id: string;
		title: string;
		description: string;
		icon?: string | null;
	}

	let {
		eyebrow = 'Services & Offerings',
		title = 'What I Can Do',
		items = []
	}: {
		eyebrow?: string | null;
		title?: string | null;
		items: ServiceItem[];
	} = $props();

	let lgCenterLast = $derived(items.length % 3 === 1);
</script>

<section id="services" class="border-b-[4px] border-black bg-[#FFF9EC] px-4 py-20 sm:px-6 lg:px-8">
	<div class="mx-auto flex max-w-7xl flex-col gap-12">
		<div class="flex flex-col gap-2">
			{#if eyebrow}
				<span
					class="inline-block w-fit rounded-[4px] border-2 border-black bg-[#4EA8DE] px-3 py-1 text-xs font-black tracking-wider text-white uppercase shadow-[2px_2px_0px_#000]"
				>
					{eyebrow}
				</span>
			{/if}
			{#if title}
				<h2 class="text-3xl font-black tracking-tight text-black uppercase sm:text-4xl lg:text-5xl">
					{title}
				</h2>
			{/if}
		</div>

		{#if items.length > 0}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each items as item, i (item.id)}
					<Card
						bg="bg-white"
						class={[
							'flex flex-col gap-4',
							lgCenterLast && i === items.length - 1 && 'lg:col-start-2'
						]
							.filter(Boolean)
							.join(' ')}
					>
						<div
							class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border-[3px] border-black bg-[#FFD60A] text-black shadow-[3px_3px_0px_#000]"
						>
							<Icon name={item.icon} size={28} />
						</div>

						<h3 class="text-xl font-black tracking-wide text-black uppercase">
							{item.title}
						</h3>

						<p class="text-base leading-relaxed font-medium text-neutral-800">
							{item.description}
						</p>
					</Card>
				{/each}
			</div>
		{:else}
			<p class="font-medium text-neutral-500 italic">No service cards listed yet.</p>
		{/if}
	</div>
</section>
