<script lang="ts">
	import type { ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import RichTextEditor from '$lib/components/admin/RichTextEditor.svelte';
	import TagInput from '$lib/components/admin/TagInput.svelte';
	import FileUpload from '$lib/components/admin/FileUpload.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let longDescription = $state('');
	let coverImageUrl = $state('');
	let coverFileName = $state('');
	let techStack = $state<string[]>([]);

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
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<AdminTitle title="Add Work Item" />

<div class="max-w-4xl space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-black tracking-tight">Create New Work Item</h1>
			<p class="text-sm text-muted-foreground">Add a new project showcase to your portfolio.</p>
		</div>

		<Button href="/admin/work" variant="outline">
			<Icon name="ArrowLeft" size={16} />
			<span>Back</span>
		</Button>
	</div>

	<form
		method="POST"
		action="?/create"
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
				<CardTitle class="text-lg font-bold">Project Details</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<input type="hidden" name="longDescription" value={longDescription} />

				<!-- Title -->
				<div class="space-y-2">
					<Label for="title">Project Title *</Label>
					<Input
						id="title"
						name="title"
						required
						placeholder="e.g. E-Commerce Platform Redesign"
						class="font-bold"
					/>
				</div>

				<!-- Short Description -->
				<div class="space-y-2">
					<Label for="shortDescription">Short Description (Card Display) *</Label>
					<Textarea
						id="shortDescription"
						name="shortDescription"
						required
						rows={2}
						placeholder="1-2 sentences summarizing the project for the work card..."
					/>
				</div>

				<!-- Cover Image Upload -->
				<div class="space-y-2">
					<Label>Cover Thumbnail Image *</Label>
					<FileUpload
						bind:value={coverImageUrl}
						bind:fileName={coverFileName}
						name="coverImageUrl"
						fileNameInputName="coverFileName"
						category="work"
					/>
				</div>

				<!-- Carousel Gallery Images -->
				<div class="space-y-2">
					<Label>Gallery Images</Label>
					
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
								<span class="text-sm font-semibold">Click or drop to upload multiple images</span>
								<span class="font-mono text-xs text-muted-foreground">
									PNG, JPG, WEBP up to 5MB each
								</span>
							</div>
						</label>
	
						<!-- Selected Files List -->
						{#if galleryFilesList.length > 0}
							<div class="space-y-2 pt-2">
								<Label class="text-xs font-semibold uppercase text-muted-foreground">
									Selected Gallery Files ({galleryFilesList.length})
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
					<RichTextEditor
						bind:value={longDescription}
						placeholder="Write the full case study, features, architecture, and outcomes..."
					/>
				</div>

				<!-- External Links -->
				<div class="grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="projectUrl">Live Project Demo URL (Optional)</Label>
						<Input id="projectUrl" name="projectUrl" placeholder="https://example.com" />
					</div>
					<div class="space-y-2">
						<Label for="repoUrl">GitHub / Source Code URL (Optional)</Label>
						<Input id="repoUrl" name="repoUrl" placeholder="https://github.com/user/repo" />
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Submit Button -->
		<div class="flex justify-end pt-2">
			<Button size="lg" type="submit" disabled={loading}>
				{#if loading}
					<Icon name="Loader2" size={16} class="animate-spin" />
					<span>Adding Work...</span>
				{:else}
					<span>Add Work</span>
				{/if}
			</Button>
		</div>
	</form>
</div>
