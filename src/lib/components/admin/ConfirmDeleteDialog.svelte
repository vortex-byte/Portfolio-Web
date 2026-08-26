<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/public/Icon.svelte';

	let {
		open = $bindable(false),
		title = 'Confirm Deletion',
		description = 'Are you sure you want to delete this record? This action cannot be undone.',
		confirmText = 'Delete',
		cancelText = 'Cancel',
		loading = false,
		onConfirm
	}: {
		open: boolean;
		title?: string;
		description?: string;
		confirmText?: string;
		cancelText?: string;
		loading?: boolean;
		onConfirm: () => void;
	} = $props();
</script>

<Dialog bind:open>
	<DialogContent>
		<DialogHeader>
			<DialogTitle class="text-xl font-bold">{title}</DialogTitle>
			<DialogDescription class="pt-1 text-sm text-muted-foreground">
				{description}
			</DialogDescription>
		</DialogHeader>

		<DialogFooter class="gap-2 pt-4 sm:gap-2">
			<Button
				type="button"
				variant="outline"
				size="lg"
				onclick={() => (open = false)}
				disabled={loading}
			>
				{cancelText}
			</Button>
			<Button type="button" variant="destructive" size="lg" onclick={onConfirm} disabled={loading}>
				{#if loading}
					<Icon name="Loader2" size={16} class="animate-spin" />
					<span>Deleting...</span>
				{:else}
					<span>{confirmText}</span>
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
