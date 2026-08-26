<script lang="ts">
	import Icon from '$lib/components/public/Icon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let {
		tags = $bindable([]),
		name = 'techStack'
	}: {
		tags?: string[];
		name?: string;
	} = $props();

	let inputVal = $state('');

	function addTag() {
		const trimmed = inputVal.trim();
		if (trimmed && !tags.includes(trimmed)) {
			tags = [...tags, trimmed];
			inputVal = '';
		}
	}

	function removeTag(tagToRemove: string) {
		tags = tags.filter((t) => t !== tagToRemove);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag();
		}
	}
</script>

<div class="flex flex-col gap-3">
	<!-- Hidden inputs for form submission array -->
	{#each tags as tag (tag)}
		<input type="hidden" {name} value={tag} />
	{/each}

	<div class="flex gap-2">
		<Input
			type="text"
			placeholder="Add tag (e.g. SvelteKit, PostgreSQL)..."
			bind:value={inputVal}
			onkeydown={handleKeyDown}
		/>
		<Button type="button" variant="secondary" onclick={addTag}>
			<Icon name="Plus" size={16} />
			<span>Add</span>
		</Button>
	</div>

	<!-- Render Tag Badges -->
	{#if tags.length > 0}
		<div class="flex flex-wrap gap-2 pt-1">
			{#each tags as tag (tag)}
				<Badge variant="secondary" class="gap-1.5 px-3 py-1 text-xs">
					<span>{tag}</span>
					<button
						type="button"
						onclick={() => removeTag(tag)}
						class="text-muted-foreground transition-colors hover:text-destructive"
					>
						<Icon name="X" size={12} />
					</button>
				</Badge>
			{/each}
		</div>
	{/if}
</div>
