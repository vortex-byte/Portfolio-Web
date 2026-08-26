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
	let techStack = $state<string[]>([]);

	let galleryItems = $state<{ id: string; file: File | null; previewUrl: string; alt: string }[]>(
		[]
	);

	function addGalleryInput() {
		galleryItems = [
			...galleryItems,
			{ id: crypto.randomUUID(), file: null, previewUrl: '', alt: '' }
		];
	}

	function removeGalleryInput(id: string) {
		const item = galleryItems.find((i) => i.id === id);
		if (item?.previewUrl) {
			URL.revokeObjectURL(item.previewUrl);
		}
		galleryItems = galleryItems.filter((i) => i.id !== id);
	}

	function handleGalleryFileChange(id: string, e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		const file = input.files[0];
		const previewUrl = URL.createObjectURL(file);
		galleryItems = galleryItems.map((item) =>
			item.id === id ? { ...item, file, previewUrl } : item
		);
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
					<FileUpload bind:value={coverImageUrl} name="coverImageUrl" category="work" />
				</div>

				<div class="space-y-2">
					<Label for="coverImageAlt">Cover Image Alt Text</Label>
					<Input
						id="coverImageAlt"
						name="coverImageAlt"
						placeholder="Project screenshot thumbnail"
					/>
				</div>

				<!-- Carousel Gallery Showcase Images -->
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0">
						<div>
							<CardTitle class="text-lg font-bold">Gallery Images</CardTitle>
							<p class="text-xs text-muted-foreground">
								Upload screenshots for the project modal carousel (Optional)
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={addGalleryInput}
							class="gap-1 text-xs"
						>
							<Icon name="Plus" size={14} />
							<span>Add Image</span>
						</Button>
					</CardHeader>
					<CardContent class="space-y-4">
						{#if galleryItems.length > 0}
							<div class="space-y-4">
								{#each galleryItems as item (item.id)}
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
												onchange={(e) => handleGalleryFileChange(item.id, e)}
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
											onclick={() => removeGalleryInput(item.id)}
											class="shrink-0 text-muted-foreground hover:text-destructive"
										>
											<Icon name="Trash2" size={16} />
										</Button>
									</div>
								{/each}
							</div>
						{:else}
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
