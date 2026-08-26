<script lang="ts">
	import Card from '../Card.svelte';
	import Icon from '../Icon.svelte';

	interface Skill {
		id: string;
		name: string;
		icon?: string | null;
		category?: string | null;
		proficiency?: number | null;
	}

	let {
		eyebrow = 'Tooling & Tech',
		title = 'Skills & Expertise',
		items = []
	}: {
		eyebrow?: string | null;
		title?: string | null;
		items: Skill[];
	} = $props();

	let categories = $derived(() => {
		const groups: Record<string, Skill[]> = {};
		for (const skill of items) {
			const cat = skill.category || 'General';
			if (!groups[cat]) groups[cat] = [];
			groups[cat].push(skill);
		}
		return groups;
	});
</script>

<section id="skills" class="border-b-[4px] border-black bg-white px-4 py-20 sm:px-6 lg:px-8">
	<div class="mx-auto flex max-w-7xl flex-col gap-12">
		<div class="flex flex-col gap-2">
			{#if eyebrow}
				<span
					class="inline-block w-fit rounded-[4px] border-2 border-black bg-[#7AE582] px-3 py-1 text-xs font-black tracking-wider text-black uppercase shadow-[2px_2px_0px_#000]"
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
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				{#each Object.entries(categories()) as [category, skillList] (category)}
					<Card bg="bg-[#FFF9EC]" class="flex flex-col gap-5">
						<h3
							class="border-b-2 border-black pb-2 text-lg font-black tracking-wider text-black uppercase"
						>
							{category}
						</h3>

						<div class="flex flex-wrap gap-3">
							{#each skillList as skill (skill.id)}
								<div
									class="inline-flex items-center gap-2 rounded-[6px] border-[2.5px] border-black bg-white px-3.5 py-2 text-sm font-bold text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-[#FFD60A]"
								>
									{#if skill.icon}
										<Icon name={skill.icon} size={18} />
									{/if}
									<span>{skill.name}</span>
									{#if skill.proficiency}
										<span
											class="rounded-[3px] bg-black px-1.5 py-0.5 font-mono text-[10px] font-black text-white"
										>
											{skill.proficiency}%
										</span>
									{/if}
								</div>
							{/each}
						</div>
					</Card>
				{/each}
			</div>
		{:else}
			<p class="font-medium text-neutral-500 italic">No skills listed yet.</p>
		{/if}
	</div>
</section>
