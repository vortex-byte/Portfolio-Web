<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import RichTextEditor from '$lib/components/admin/RichTextEditor.svelte';
	import TagInput from '$lib/components/admin/TagInput.svelte';
	import FileUpload from '$lib/components/admin/FileUpload.svelte';
	import ConfirmDeleteDialog from '$lib/components/admin/ConfirmDeleteDialog.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let work = $derived(data.work);
	let images = $derived(data.images);

	let loading = $state(false);
	let longDescription = $state('');
	let coverImageUrl = $state('');
	let techStack = $state<string[]>([]);
	let confirmOpen = $state(false);
	let deleteImageId = $state<string | null>(null);

	let newGalleryItems = $state<
		{ id: string; file: File | null; previewUrl: string; alt: string }[]
	>([]);

	function addNewGalleryInput() {
		newGalleryItems = [
			...newGalleryItems,
			{ id: crypto.randomUUID(), file: null, previewUrl: '', alt: '' }
		];
	}

	function removeNewGalleryInput(id: string) {
		const item = newGalleryItems.find((i) => i.id === id);
		if (item?.previewUrl) {
			URL.revokeObjectURL(item.previewUrl);
		}
		newGalleryItems = newGalleryItems.filter((i) => i.id !== id);
	}

	function handleNewGalleryFileChange(id: string, e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		const file = input.files[0];
		const previewUrl = URL.createObjectURL(file);
		newGalleryItems = newGalleryItems.map((item) =>
			item.id === id ? { ...item, file, previewUrl } : item
		);
	}

	$effect(() => {
		longDescription = work.longDescription ?? '';
		coverImageUrl = work.coverImageUrl ?? '';
		techStack = work.techStack || [];
	});

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		} else if (form?.success) {
			toast.success('Work updated successfully!');
			confirmOpen = false;
			deleteImageId = null;
			newGalleryItems = [];
		}
	});

	function promptDeleteImage(imageId: string) {
		deleteImageId = imageId;
		confirmOpen = true;
	}

	function confirmDeleteImage() {
		if (!deleteImageId) return;
		const formEl = document.getElementById(`delete-gallery-${deleteImageId}`) as HTMLFormElement;
		if (formEl) formEl.requestSubmit();
	}
</script>

<AdminTitle title="Edit Work Item" />

<div class="max-w-4xl space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-black tracking-tight">Edit Work Item</h1>
			<p class="text-sm text-muted-foreground">
				Update project details, cover photo, gallery images, and tech stack tags.
			</p>
		</div>

		<Button href="/admin/work" variant="outline">
			<Icon name="ArrowLeft" size={16} />
			<span>Back</span>
		</Button>
	</div>

	<!-- Main Details & Gallery Form -->
	<form
		method="POST"
		action="?/update"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update({ reset: false });
			};
		}}
		class="space-y-6"
	>
		<Card>
			<CardHeader>
				<CardTitle class="text-lg font-bold">Project Information</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<input type="hidden" name="longDescription" value={longDescription} />

				<!-- Title -->
				<div class="space-y-2">
					<Label for="title">Project Title *</Label>
					<Input id="title" name="title" value={work.title} required class="font-bold" />
				</div>

				<!-- Short Description -->
				<div class="space-y-2">
					<Label for="shortDescription">Short Description (Card Display) *</Label>
					<Textarea
						id="shortDescription"
						name="shortDescription"
						value={work.shortDescription}
						required
						rows={2}
					/>
				</div>

				<!-- Cover Image Upload -->
				<div class="space-y-2">
					<Label>Cover Thumbnail Image *</Label>
					<FileUpload bind:value={coverImageUrl} name="coverImageUrl" category="work" />
				</div>

				<div class="space-y-2">
					<Label for="coverImageAlt">Cover Image Alt Text</Label>
					<Input id="coverImageAlt" name="coverImageAlt" value={work.coverImageAlt ?? ''} />
				</div>

				<!-- Carousel Gallery Showcase Images -->
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0">
						<div>
							<CardTitle class="text-lg font-bold">Gallery Images (Carousel Showcase)</CardTitle>
							<p class="text-xs text-muted-foreground">
								Manage screenshots shown in the project modal carousel.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={addNewGalleryInput}
							class="gap-1 text-xs"
						>
							<Icon name="Plus" size={14} />
							<span>Add Image</span>
						</Button>
					</CardHeader>
					<CardContent class="space-y-6">
						<!-- Existing Uploaded Gallery Images -->
						{#if images && images.length > 0}
							<div class="space-y-2">
								<Label class="text-xs font-semibold text-muted-foreground uppercase"
									>Existing Gallery Screenshots</Label
								>
								<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
									{#each images as img (img.id)}
										<div
											class="group relative aspect-video overflow-hidden rounded-lg border bg-card"
										>
											<img
												src={img.imageUrl}
												alt={img.imageAlt || 'Gallery screenshot'}
												class="h-full w-full object-cover"
											/>
											<div
												class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
											>
												<Button
													type="button"
													variant="destructive"
													size="sm"
													class="gap-1 text-xs"
													onclick={() => promptDeleteImage(img.id)}
												>
													<Icon name="Trash2" size={14} />
													<span>Delete</span>
												</Button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- New Pending Gallery Uploads -->
						{#if newGalleryItems.length > 0}
							<div class="space-y-3">
								<Label class="text-xs font-semibold text-muted-foreground uppercase"
									>New Gallery Screenshots to Upload</Label
								>
								{#each newGalleryItems as item (item.id)}
									<div
										class="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center"
									>
										{#if item.previewUrl}
											<div class="h-16 w-24 shrink-0 overflow-hidden rounded border bg-card">
												<img
													src={item.previewUrl}
													alt="Preview"
													class="h-full w-full object-cover"
												/>
											</div>
										{/if}
										<div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
											<Input
												type="file"
												name="galleryFiles"
												accept="image/jpeg,image/png,image/webp"
												onchange={(e) => handleNewGalleryFileChange(item.id, e)}
												required
												class="text-sm"
											/>
											<Input
												type="text"
												name="galleryAlts"
												bind:value={item.alt}
												placeholder="Alt text (e.g. Dashboard preview)"
												class="text-sm"
											/>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onclick={() => removeNewGalleryInput(item.id)}
											class="shrink-0 text-muted-foreground hover:text-destructive"
										>
											<Icon name="Trash2" size={16} />
										</Button>
									</div>
								{/each}
							</div>
						{/if}

						{#if (!images || images.length === 0) && newGalleryItems.length === 0}
							<p class="text-sm text-muted-foreground italic">
								No gallery carousel images added yet. Click "Add Image" to upload screenshots.
							</p>
						{/if}
					</CardContent>
				</Card>

				<!-- Tech Stack Tags -->
				<div class="space-y-2">
					<Label>Tech Stack Tags</Label>
					<TagInput bind:tags={techStack} name="techStack" />
				</div>

				<!-- Long Description (Tiptap WYSIWYG) -->
				<div class="space-y-2">
					<Label>Full Description *</Label>
					<RichTextEditor bind:value={longDescription} />
				</div>

				<!-- External Links -->
				<div class="grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="projectUrl">Live Project Demo URL</Label>
						<Input id="projectUrl" name="projectUrl" value={work.projectUrl ?? ''} />
					</div>
					<div class="space-y-2">
						<Label for="repoUrl">GitHub / Source Code URL</Label>
						<Input id="repoUrl" name="repoUrl" value={work.repoUrl ?? ''} />
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Submit Button -->
		<div class="flex justify-end pt-2">
			<Button size="lg" type="submit" disabled={loading}>
				{#if loading}
					<Icon name="Loader2" size={16} class="animate-spin" />
					<span>Saving Changes...</span>
				{:else}
					<span>Save Changes</span>
				{/if}
			</Button>
		</div>
	</form>

	<!-- Hidden form for deleting single existing gallery image -->
	{#if deleteImageId}
		<form
			id="delete-gallery-{deleteImageId}"
			method="POST"
			action="?/deleteGalleryImage"
			use:enhance
			class="hidden"
		>
			<input type="hidden" name="imageId" value={deleteImageId} />
		</form>
	{/if}
</div>

<ConfirmDeleteDialog
	bind:open={confirmOpen}
	title="Delete Gallery Image"
	description="Are you sure you want to delete this screenshot from the gallery carousel?"
	onConfirm={confirmDeleteImage}
/>
