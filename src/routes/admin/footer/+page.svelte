<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import IconPicker from '$lib/components/admin/IconPicker.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	interface SocialLink {
		platform: string;
		url: string;
		icon: string;
	}

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let footer = $derived(data.footer);

	let loading = $state(false);
	let copyrightText = $state('');
	let links = $state<SocialLink[]>([]);

	$effect(() => {
		copyrightText = footer?.copyrightText ?? '© 2026 Developer Portfolio. All rights reserved.';
		links = (footer?.socialLinks as SocialLink[]) || [
			{ platform: 'GitHub', url: 'https://github.com/yourname', icon: 'Github' },
			{ platform: 'LinkedIn', url: 'https://linkedin.com/in/yourname', icon: 'Linkedin' }
		];
	});

	$effect(() => {
		if (form?.success) {
			toast.success('Footer settings updated successfully!');
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	function addLink() {
		links = [...links, { platform: '', url: '', icon: 'Link' }];
	}

	function removeLink(index: number) {
		links = links.filter((_, i) => i !== index);
	}

	let socialLinksJson = $derived(JSON.stringify(links));
</script>

<AdminTitle title="Manage Footer" />

<div class="max-w-4xl space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-black tracking-tight">Footer Settings</h1>
			<p class="text-sm text-muted-foreground">
				Manage the site copyright text and social media links displayed at the bottom of all public
				pages.
			</p>
		</div>
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">Copyright & Social Links</CardTitle>
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
				<input type="hidden" name="socialLinks" value={socialLinksJson} />

				<!-- Copyright Text -->
				<div class="space-y-2">
					<Label for="copyrightText">Copyright Text</Label>
					<Input
						id="copyrightText"
						name="copyrightText"
						bind:value={copyrightText}
						placeholder="© 2026 Your Name. All rights reserved."
					/>
				</div>

				<!-- Social Links List -->
				<div class="space-y-4 border-t pt-4">
					<div class="flex items-center justify-between">
						<Label>Social Media Links</Label>
						<Button type="button" variant="outline" size="sm" onclick={addLink} class="gap-1.5 text-xs">
							<Icon name="Plus" size={14} />
							<span>Add Social Link</span>
						</Button>
					</div>

					{#if links.length > 0}
						<div class="space-y-3">
							{#each links as link, idx (idx)}
								<div
									class="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs sm:flex-row sm:items-center"
								>
									<!-- Icon Picker Direct Inline -->
									<div class="w-full sm:w-48 shrink-0">
										<IconPicker bind:value={link.icon} />
									</div>

									<!-- Inline Editable Platform Input -->
									<div class="w-full sm:w-44 shrink-0">
										<Input
											placeholder="Platform (e.g. GitHub)"
											bind:value={link.platform}
											class="text-sm font-semibold"
										/>
									</div>

									<!-- Inline Editable URL Input -->
									<div class="flex-1">
										<Input
											placeholder="URL (https://...)"
											bind:value={link.url}
											class="font-mono text-sm"
										/>
									</div>

									<!-- Delete Button -->
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onclick={() => removeLink(idx)}
										class="shrink-0 text-muted-foreground hover:text-destructive"
										title="Delete link"
									>
										<Icon name="Trash2" size={16} />
									</Button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm italic text-muted-foreground">
							No social media links added. Click "Add Social Link" above to create one.
						</p>
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
