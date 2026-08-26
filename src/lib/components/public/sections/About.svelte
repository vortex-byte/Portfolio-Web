<script lang="ts">
	import Card from '../Card.svelte';

	let {
		eyebrow = 'Who I Am',
		title = 'About Me',
		content = ''
	}: {
		eyebrow?: string | null;
		title?: string | null;
		content?: string;
	} = $props();
</script>

<section id="about" class="border-b-[4px] border-black bg-white px-4 py-20 sm:px-6 lg:px-8">
	<div class="mx-auto flex max-w-7xl flex-col gap-10">
		<div class="flex flex-col gap-2">
			{#if eyebrow}
				<span
					class="inline-block w-fit rounded-[4px] border-2 border-black bg-[#FF3EA5] px-3 py-1 text-xs font-black tracking-wider text-white uppercase shadow-[2px_2px_0px_#000]"
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

		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<div class="lg:col-span-12">
				<Card bg="bg-[#FFF9EC]">
					<div
						class="prose prose-lg prose-p:font-medium prose-p:text-neutral-900 prose-headings:font-black prose-headings:uppercase prose-a:text-[#FF3EA5] prose-a:font-bold max-w-none"
					>
						{@html content}
					</div>
				</Card>
			</div>
		</div>
	</div>
</section>
