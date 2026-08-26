<script lang="ts">
	import Icon from '$lib/components/public/Icon.svelte';
	import { Button } from '$lib/components/ui/button';

	let {
		value = $bindable(''),
		name = 'imageUrl',
		category = 'work'
	}: {
		value?: string | null;
		name?: string;
		category?: string;
	} = $props();

	let uploading = $state(false);
	let errorMsg = $state('');

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		uploading = true;
		errorMsg = '';

		const formData = new FormData();
		formData.append('file', file);
		formData.append('category', category);

		try {
			const res = await fetch('/api/admin/upload', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || 'Upload failed');
			}

			value = data.url;
		} catch (err: unknown) {
			const errorObj = err as Error;
			errorMsg = errorObj.message || 'Image upload failed';
		} finally {
			uploading = false;
		}
	}

	function clearImage() {
		value = '';
	}
</script>

<div class="flex flex-col gap-3">
	<input type="hidden" {name} value={value || ''} />

	{#if value}
		<div class="group relative aspect-video max-w-sm overflow-hidden rounded-lg border bg-card">
			<img src={value} alt="Uploaded file preview" class="h-full w-full object-cover" />
			<div
				class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<Button type="button" variant="destructive" size="sm" onclick={clearImage} class="gap-1.5">
					<Icon name="Trash2" size={14} />
					<span>Remove</span>
				</Button>
			</div>
		</div>
	{:else}
		<label
			class="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card/50 p-6 text-center transition-colors hover:border-foreground/50"
		>
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onchange={handleFileSelect}
				disabled={uploading}
				class="sr-only"
			/>
			<Icon name="UploadCloud" size={32} class="text-muted-foreground" />
			<div class="flex flex-col gap-1">
				<span class="text-sm font-semibold">
					{uploading ? 'Processing Image...' : 'Click or drop to upload'}
				</span>
				<span class="font-mono text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
			</div>
		</label>
	{/if}

	{#if errorMsg}
		<span class="text-xs font-semibold text-red-400">{errorMsg}</span>
	{/if}
</div>
