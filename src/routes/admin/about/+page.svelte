<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import RichTextEditor from '$lib/components/admin/RichTextEditor.svelte';
	import FileUpload from '$lib/components/admin/FileUpload.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let about = $derived(data.about);
	let sectionHeader = $derived(data.sectionHeader);

	let loading = $state(false);
	let bioContent = $state('');
	let imagePath = $state('');
	let initialized = $state(false);

	$effect(() => {
		if (about && !initialized) {
			bioContent = about.content ?? '';
			imagePath = about.imagePath ?? '';
			initialized = true;
		}
	});

	$effect(() => {
		if (form?.headerSuccess) {
			toast.success('Section header updated successfully!');
		} else if (form?.success) {
			toast.success('About Me section updated successfully!');
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<AdminTitle title="Manage About Me" />

<div class="max-w-4xl space-y-6">
	<div>
		<h1 class="text-3xl font-black tracking-tight">About Me</h1>
		<p class="text-sm text-muted-foreground">
			Edit your biography, background narrative, and optional profile/supporting image.
		</p>
	</div>

	<!-- Section Header Settings Card -->
	<Card class="p-6">
		<form method="POST" action="?/saveHeader" use:enhance class="space-y-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<h2 class="text-lg font-bold">Section Settings</h2>
				<div class="flex items-center gap-3">
					<span class="text-sm font-semibold">Show Section on Homepage</span>
					<input
						type="hidden"
						name="isVisible"
						value={(sectionHeader?.isVisible ?? true).toString()}
					/>
					<Switch
						checked={sectionHeader?.isVisible ?? true}
						onCheckedChange={(val) => {
							const formEl = document.querySelector(
								'form[action="?/saveHeader"]'
							) as HTMLFormElement;
							const hidden = formEl?.querySelector('input[name="isVisible"]') as HTMLInputElement;
							if (hidden) hidden.value = val.toString();
						}}
					/>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="eyebrow">Eyebrow Text</Label>
					<Input
						id="eyebrow"
						name="eyebrow"
						value={sectionHeader?.eyebrow ?? 'Who I Am'}
						placeholder="e.g. Who I Am"
					/>
				</div>
				<div class="space-y-2">
					<Label for="header-title">Section Title</Label>
					<Input
						id="header-title"
						name="title"
						value={sectionHeader?.title ?? 'About Me'}
						placeholder="e.g. About Me"
					/>
				</div>
			</div>
			<div class="flex justify-end">
				<Button type="submit" size="sm" variant="outline">Save Header</Button>
			</div>
		</form>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">Biography</CardTitle>
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				action="?/save"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update({ reset: false });
					};
				}}
				class="space-y-6"
			>
				<input type="hidden" name="content" value={bioContent} />

				<!-- Rich Text Bio Editor -->
				<div class="space-y-2">
					<RichTextEditor
						bind:value={bioContent}
						placeholder="Write your biography, experience, and background..."
					/>
				</div>

				<!-- Supporting Image -->
				<div class="space-y-4 border-t pt-2">
					<Label>Supporting / Bio Image (Optional)</Label>
					<FileUpload bind:value={imagePath} name="imagePath" category="about" />

					<div class="space-y-2">
						<Label for="imageAlt">Image Alt Text (Accessibility)</Label>
						<Input id="imageAlt" name="imageAlt" value={about?.imageAlt ?? 'About Me Photo'} />
					</div>
				</div>

				<!-- Submit Button -->
				<div class="flex justify-end pt-4">
					<Button size="lg" type="submit" disabled={loading}>
						{#if loading}
							<Icon name="Loader2" size={16} class="animate-spin" />
							<span>Saving...</span>
						{:else}
							<span>Apply Settings</span>
						{/if}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
