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
	let coverImagePath = $state('');
	let coverFileName = $state('');
	let techStack = $state<string[]>([]);
	let confirmOpen = $state(false);
	let deleteImageId = $state<string | null>(null);

	let galleryFilesList = $state<File[]>([]);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let isDraggingGallery = $state(false);

	function addFilesToList(files: FileList | File[]) {
		const selectedFiles = Array.from(files);
		galleryFilesList = [...galleryFilesList, ...selectedFiles];
		syncFileInput();
	}

	function handleBatchGallerySelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		addFilesToList(input.files);
	}

	function handleGalleryDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDraggingGallery = true;
	}

	function handleGalleryDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDraggingGallery = false;
	}

	function handleGalleryDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDraggingGallery = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			addFilesToList(e.dataTransfer.files);
		}
	}

	function removeGalleryFile(index: number) {
		galleryFilesList = galleryFilesList.filter((_, i) => i !== index);
		syncFileInput();
	}

	function syncFileInput() {
		if (!fileInputRef) return;
		const dt = new DataTransfer();
		for (const file of galleryFilesList) {
			dt.items.add(file);
		}
		fileInputRef.files = dt.files;
	}

	$effect(() => {
		longDescription = work.longDescription ?? '';
		coverImagePath = work.coverImagePath ?? '';
		techStack = work.techStack || [];
	});

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		} else if (form?.success) {
			toast.success('Work updated successfully!');
			confirmOpen = false;
			deleteImageId = null;
			galleryFilesList = [];
			syncFileInput();
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
					<FileUpload
						bind:value={coverImagePath}
						bind:fileName={coverFileName}
						name="coverImagePath"
						fileNameInputName="coverFileName"
						category="work"
					/>
				</div>

				<!-- Carousel Gallery Showcase Images -->
				 <div class="space-y-2">
				 	<Label>Gallery Images</Label>

					<!-- Existing Uploaded Gallery Images -->
					{#if images && images.length > 0}
						<div class="space-y-2">
							<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
								{#each images as img (img.id)}
									<div
										class="group relative aspect-video overflow-hidden rounded-lg border bg-card"
									>
										<img
											src={img.imagePath}
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

					<!-- Batch Upload Input -->
					<div class="space-y-3">
						<!-- Hidden actual file input bound to form -->
						<input
							bind:this={fileInputRef}
							type="file"
							name="galleryFiles"
							multiple
							accept="image/jpeg,image/png,image/webp"
							class="hidden"
						/>

							<!-- Dropzone / Selection Box -->
							<label
								ondragover={handleGalleryDragOver}
								ondragleave={handleGalleryDragLeave}
								ondrop={handleGalleryDrop}
								class="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors {isDraggingGallery
									? 'border-primary bg-primary/10'
									: 'border-border bg-card/50 hover:border-foreground/50'}"
							>
								<input
									type="file"
									multiple
									accept="image/jpeg,image/png,image/webp"
									onchange={handleBatchGallerySelect}
									class="sr-only"
								/>
								<Icon name="UploadCloud" size={32} class="text-muted-foreground" />
								<div class="flex flex-col gap-1">
									<span class="text-sm font-semibold">Click or drop to batch upload images</span>
									<span class="font-mono text-xs text-muted-foreground">
										PNG, JPG, WEBP up to 5MB each
									</span>
								</div>
							</label>

						<!-- Selected New Images List -->
						{#if galleryFilesList.length > 0}
							<div class="space-y-2 pt-2">
								<Label class="text-xs font-semibold text-muted-foreground">
									New Images to Upload ({galleryFilesList.length})
								</Label>
								<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
									{#each galleryFilesList as file, i (file.name + i)}
										<div
											class="flex items-center justify-between gap-2 rounded-md border bg-muted/40 p-2.5 text-sm"
										>
											<div class="flex items-center gap-2 overflow-hidden">
												<Icon name="Image" size={16} class="shrink-0 text-muted-foreground" />
												<span class="truncate font-medium">{file.name}</span>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onclick={() => removeGalleryFile(i)}
												class="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
											>
												<Icon name="X" size={14} />
											</Button>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				 </div>

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
