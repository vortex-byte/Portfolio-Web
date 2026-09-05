<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import FileUpload from '$lib/components/admin/FileUpload.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let hero = $derived(data.hero);
	let sectionHeader = $derived(data.sectionHeader);

	let loading = $state(false);
	let photoPath = $derived(hero?.photoPath ?? '');
	let photoZoom = $state(100);

	$effect(() => {
		if (hero?.photoZoom !== undefined && hero?.photoZoom !== null) {
			photoZoom = hero.photoZoom;
		}
	});

	$effect(() => {
		if (form?.headerSuccess) {
			toast.success('Section header updated successfully!');
		} else if (form?.success) {
			toast.success('Hero section updated successfully!');
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<AdminTitle title="Manage Hero Banner" />

<div class="max-w-4xl space-y-6">
	<div>
		<h1 class="text-3xl font-black tracking-tight">Hero Banner</h1>
		<p class="text-sm text-muted-foreground">
			Edit the main headline, description, call-to-action buttons, and photo displayed at the top of
			your homepage.
		</p>
	</div>

	<!-- Section Header Settings Card (Eyebrow Badge & Section Visibility) -->
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
			<div class="space-y-2">
				<Label for="eyebrow">Eyebrow Text (Badge above headline)</Label>
				<Input
					id="eyebrow"
					name="eyebrow"
					value={sectionHeader?.eyebrow ?? 'Full-Stack, Backend, IoT Developer'}
					placeholder="e.g. Full-Stack, Backend, IoT Developer"
				/>
			</div>
			<div class="flex justify-end">
				<Button type="submit" size="sm" variant="outline">Save Header</Button>
			</div>
		</form>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">Hero Content & Layout</CardTitle>
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
				<!-- Main Headline -->
				<div class="space-y-2">
					<Label for="title">Headline Title *</Label>
					<Input
						id="title"
						name="title"
						value={hero?.title ?? ''}
						required
						placeholder="e.g. Web Developer & Designer"
						class="font-bold"
					/>
				</div>

				<!-- Tagline / Description -->
				<div class="space-y-2">
					<Label for="description">Tagline *</Label>
					<Textarea
						id="description"
						name="description"
						value={hero?.description ?? ''}
						required
						rows={3}
						placeholder="Short tagline about your expertise..."
					/>
				</div>

				<!-- CTA Buttons -->
				<div class="grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="ctaPrimaryLabel">Primary CTA Label</Label>
						<Input
							id="ctaPrimaryLabel"
							name="ctaPrimaryLabel"
							value={hero?.ctaPrimaryLabel ?? 'View My Work'}
						/>
					</div>
					<div class="space-y-2">
						<Label for="ctaPrimaryUrl">Primary CTA Link</Label>
						<Input id="ctaPrimaryUrl" name="ctaPrimaryUrl" value={hero?.ctaPrimaryUrl ?? '/work'} />
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="ctaSecondaryLabel">Secondary CTA Label</Label>
						<Input
							id="ctaSecondaryLabel"
							name="ctaSecondaryLabel"
							value={hero?.ctaSecondaryLabel ?? 'Contact Me'}
						/>
					</div>
					<div class="space-y-2">
						<Label for="ctaSecondaryUrl">Secondary CTA Link</Label>
						<Input
							id="ctaSecondaryUrl"
							name="ctaSecondaryUrl"
							value={hero?.ctaSecondaryUrl ?? '/#contact'}
						/>
					</div>
				</div>

				<!-- Owner Photo & Alt & Zoom -->
				<div class="space-y-4 border-t pt-2">
					<div class="flex items-center justify-between gap-2">
						<div>
							<Label class="text-base font-bold">Hero Photo Card</Label>
							<p class="text-xs text-muted-foreground">
								Display the stacked photo composition on the right side of the hero section.
							</p>
						</div>
						<div class="flex items-center gap-2">
							<input type="hidden" name="showPhoto" value={(hero?.showPhoto ?? true).toString()} />
							<Switch
								checked={hero?.showPhoto ?? true}
								onCheckedChange={(val) => {
									const hidden = document.querySelector(
										'input[name="showPhoto"]'
									) as HTMLInputElement;
									if (hidden) hidden.value = val.toString();
								}}
							/>
						</div>
					</div>

					<FileUpload bind:value={photoPath} name="photoPath" category="hero" />

					<div class="space-y-2">
						<Label for="photoAlt">Photo Alt Text (Accessibility)</Label>
						<Input id="photoAlt" name="photoAlt" value={hero?.photoAlt ?? 'Web Developer Photo'} />
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label for="photoZoom">Photo Zoom Level ({photoZoom}%)</Label>
							<span class="text-xs text-muted-foreground">Range: 50% - 200%</span>
						</div>
						<input
							type="range"
							id="photoZoom"
							name="photoZoom"
							min="50"
							max="200"
							step="1"
							bind:value={photoZoom}
							class="w-full cursor-pointer accent-primary"
						/>
					</div>

					<!-- Image Preview with B&W + Zoom applied -->
					{#if photoPath}
						<div class="space-y-2">
							<Label>Live Preview</Label>
							<div
								class="relative flex aspect-square w-48 items-center justify-center overflow-hidden rounded-md border bg-muted"
							>
								<img
									src={photoPath}
									alt="Preview"
									class="h-full w-auto object-contain grayscale transition-transform duration-100"
									style="transform: scale({photoZoom / 100});"
								/>
							</div>
						</div>
					{/if}
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
