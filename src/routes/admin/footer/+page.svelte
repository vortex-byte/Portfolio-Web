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

	let newPlatform = $state('');
	let newUrl = $state('');
	let newIcon = $state('Github');

	$effect(() => {
		if (form?.success) {
			toast.success('Footer settings updated successfully!');
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	function addLink() {
		if (newPlatform.trim() && newUrl.trim()) {
			links = [...links, { platform: newPlatform.trim(), url: newUrl.trim(), icon: newIcon }];
			newPlatform = '';
			newUrl = '';
		}
	}

	function removeLink(index: number) {
		links = links.filter((_, i) => i !== index);
	}

	let socialLinksJson = $derived(JSON.stringify(links));
</script>

<AdminTitle title="Manage Footer" />

<div class="max-w-4xl space-y-6">
	<div>
		<h1 class="text-3xl font-black tracking-tight">Footer Settings</h1>
		<p class="text-sm text-muted-foreground">
			Manage the site copyright text and social media links displayed at the bottom of all public
			pages.
		</p>
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
				<div class="space-y-4 border-t pt-2">
					<Label>Social Media Links</Label>

					{#if links.length > 0}
						<div class="space-y-2">
							{#each links as link, idx (idx)}
								<div
									class="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3 text-sm"
								>
									<div class="flex items-center gap-3">
										<div class="flex h-8 w-8 items-center justify-center rounded border bg-card">
											<Icon name={link.icon} size={16} />
										</div>
										<div class="flex flex-col">
											<span class="font-bold">{link.platform}</span>
											<span class="font-mono text-xs text-muted-foreground">{link.url}</span>
										</div>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onclick={() => removeLink(idx)}
										class="text-muted-foreground hover:text-destructive"
									>
										<Icon name="Trash2" size={16} />
									</Button>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Add New Social Link Row -->
					<div class="space-y-3 rounded-lg border bg-muted/20 p-4">
						<span class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
							>Add Social Link</span
						>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<Input
								placeholder="Platform (e.g. GitHub)"
								bind:value={newPlatform}
								class="text-sm"
							/>
							<Input placeholder="URL (https://...)" bind:value={newUrl} class="text-sm" />
							<IconPicker bind:value={newIcon} />
						</div>
						<Button type="button" variant="secondary" onclick={addLink} class="gap-1.5 text-xs">
							<Icon name="Plus" size={14} />
							<span>Add Link</span>
						</Button>
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
