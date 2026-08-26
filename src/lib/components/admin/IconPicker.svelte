<script lang="ts">
	import Icon from '$lib/components/public/Icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { Input } from '$lib/components/ui/input';

	let {
		value = $bindable('CodeXml'),
		name = 'icon'
	}: {
		value?: string | null;
		name?: string;
	} = $props();

	let open = $state(false);
	let searchQuery = $state('');
	let visibleIcons = $state<string[]>([]);
	let loading = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout>;

	async function fetchIcons(query: string) {
		loading = true;
		try {
			const res = await fetch(`/api/admin/icons?q=${encodeURIComponent(query)}`);
			if (res.ok) {
				const data = await res.json();
				visibleIcons = data.icons || [];
			}
		} catch {
			visibleIcons = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (open) {
			const query = searchQuery;
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				fetchIcons(query);
			}, 150);
		}
	});

	function selectIcon(iconName: string) {
		value = iconName;
		open = false;
	}
</script>

<input type="hidden" {name} value={value || ''} />

<Popover bind:open>
	<PopoverTrigger>
		<Button type="button" variant="outline" class="w-full justify-between">
			<div class="flex items-center gap-2">
				{#if value}
					<Icon name={value} size={18} />
					<span class="font-mono text-sm">{value}</span>
				{:else}
					<span class="text-sm text-muted-foreground">Select icon...</span>
				{/if}
			</div>
			<Icon name="ChevronsUpDown" size={16} class="text-muted-foreground" />
		</Button>
	</PopoverTrigger>
	<PopoverContent class="w-72 p-2">
		<div class="space-y-2">
			<Input placeholder="Search icon name..." bind:value={searchQuery} class="h-8 text-sm" />
			{#if loading}
				<div class="p-4 text-center text-xs text-muted-foreground">Searching icons...</div>
			{:else if visibleIcons.length === 0}
				<div class="p-4 text-center text-xs text-muted-foreground">No matching icon found.</div>
			{:else}
				<div class="max-h-60 space-y-1 overflow-y-auto">
					{#each visibleIcons as iconName (iconName)}
						<button
							type="button"
							onclick={() => selectIcon(iconName)}
							class="flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground {value ===
							iconName
								? 'bg-accent font-bold'
								: ''}"
						>
							<Icon name={iconName} size={18} />
							<span class="font-mono">{iconName}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</PopoverContent>
</Popover>
