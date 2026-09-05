<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import ConfirmDeleteDialog from '$lib/components/admin/ConfirmDeleteDialog.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Table,
		TableHeader,
		TableRow,
		TableHead,
		TableBody,
		TableCell
	} from '$lib/components/ui/table';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let items = $derived(data.items);
	let sectionHeader = $derived(data.sectionHeader);
	let deleteId = $state<string | null>(null);
	let confirmOpen = $state(false);

	$effect(() => {
		if (form?.headerSuccess) {
			toast.success('Section header updated successfully!');
		} else if (form?.error) {
			toast.error(form.error);
		} else if (form?.success) {
			toast.success('Work items updated!');
			confirmOpen = false;
			deleteId = null;
		}
	});

	function promptDelete(id: string) {
		deleteId = id;
		confirmOpen = true;
	}

	function confirmDelete() {
		if (!deleteId) return;
		const formEl = document.getElementById(`delete-form-${deleteId}`) as HTMLFormElement;
		if (formEl) formEl.requestSubmit();
	}
</script>

<AdminTitle title="Manage Work" />

<div class="space-y-6">
	<div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-black tracking-tight">Work</h1>
			<p class="text-sm text-muted-foreground">
				Manage portfolio project showcases, gallery screenshots, tech stack tags, and homepage
				pinned status (max 3 pinned).
			</p>
		</div>

		<Button href="/admin/work/new">
			<Icon name="Plus" size={18} />
			<span>Add Work</span>
		</Button>
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
						value={sectionHeader?.eyebrow ?? 'Featured Projects'}
						placeholder="e.g. Featured Projects"
					/>
				</div>
				<div class="space-y-2">
					<Label for="header-title">Section Title</Label>
					<Input
						id="header-title"
						name="title"
						value={sectionHeader?.title ?? 'My Work'}
						placeholder="e.g. My Work"
					/>
				</div>
			</div>
			<div class="flex justify-end">
				<Button type="submit" size="sm" variant="outline">Save Header</Button>
			</div>
		</form>
	</Card>

	<!-- Data Table -->
	<Card>
		<CardContent class="p-0">
			{#if items.length > 0}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead class="w-16">Order</TableHead>
							<TableHead class="w-20">Cover</TableHead>
							<TableHead>Title / Slug</TableHead>
							<TableHead>Tech Stack</TableHead>
							<TableHead class="w-28">Pinned (3 max)</TableHead>
							<TableHead class="w-24">Visible</TableHead>
							<TableHead class="w-24 text-right"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each items as item, index (item.id)}
							<TableRow>
								<TableCell>
									<div class="flex items-center gap-0.5">
										<form method="POST" action="?/reorder" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="direction" value="up" />
											<Button
												type="submit"
												variant="ghost"
												size="icon"
												disabled={index === 0}
												class="h-7 w-7"
											>
												<Icon name="ChevronUp" size={14} />
											</Button>
										</form>
										<form method="POST" action="?/reorder" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="direction" value="down" />
											<Button
												type="submit"
												variant="ghost"
												size="icon"
												disabled={index === items.length - 1}
												class="h-7 w-7"
											>
												<Icon name="ChevronDown" size={14} />
											</Button>
										</form>
									</div>
								</TableCell>
								<TableCell>
									<div class="h-9 w-14 shrink-0 overflow-hidden rounded border bg-muted">
										<img
											src={item.coverImagePath}
											alt={item.title}
											class="h-full w-full object-cover"
										/>
									</div>
								</TableCell>
								<TableCell>
									<div class="flex flex-col">
										<span class="text-base font-bold">{item.title}</span>
										<span class="font-mono text-xs text-muted-foreground">/{item.slug}</span>
									</div>
								</TableCell>
								<TableCell>
									{#if item.techStack && item.techStack.length > 0}
										<div class="flex flex-wrap gap-1">
											{#each item.techStack.slice(0, 3) as tag (tag)}
												<Badge variant="secondary" class="text-[10px]">
													{tag}
												</Badge>
											{/each}
											{#if item.techStack.length > 3}
												<span class="font-mono text-[10px] text-muted-foreground"
													>+{item.techStack.length - 3}</span
												>
											{/if}
										</div>
									{:else}
										<span class="font-mono text-xs text-muted-foreground">None</span>
									{/if}
								</TableCell>

								<!-- Pinned Switch & Order -->
								<TableCell>
									<div class="flex items-center gap-2">
										<form id="pin-form-{item.id}" method="POST" action="?/togglePin" use:enhance>
											<input type="hidden" name="id" value={item.id} />
											<input type="hidden" name="isPinned" value={(!item.isPinned).toString()} />
											<Switch
												checked={item.isPinned}
												onCheckedChange={() => {
													const formEl = document.getElementById(
														`pin-form-${item.id}`
													) as HTMLFormElement;
													if (formEl) formEl.requestSubmit();
												}}
											/>
										</form>

										{#if item.isPinned}
											<div class="flex items-center gap-0.5">
												<form method="POST" action="?/reorderPinned" use:enhance>
													<input type="hidden" name="id" value={item.id} />
													<input type="hidden" name="direction" value="up" />
													<Button
														type="submit"
														variant="ghost"
														size="icon"
														class="h-6 w-6"
														title="Move Pinned Up"
													>
														<Icon name="ChevronUp" size={12} />
													</Button>
												</form>
												<form method="POST" action="?/reorderPinned" use:enhance>
													<input type="hidden" name="id" value={item.id} />
													<input type="hidden" name="direction" value="down" />
													<Button
														type="submit"
														variant="ghost"
														size="icon"
														class="h-6 w-6"
														title="Move Pinned Down"
													>
														<Icon name="ChevronDown" size={12} />
													</Button>
												</form>
											</div>
										{/if}
									</div>
								</TableCell>

								<!-- Visible Switch -->
								<TableCell>
									<form
										id="vis-form-{item.id}"
										method="POST"
										action="?/toggleVisibility"
										use:enhance
									>
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="isVisible" value={(!item.isVisible).toString()} />
										<Switch
											checked={item.isVisible}
											onCheckedChange={() => {
												const formEl = document.getElementById(
													`vis-form-${item.id}`
												) as HTMLFormElement;
												if (formEl) formEl.requestSubmit();
											}}
										/>
									</form>
								</TableCell>

								<!-- Actions -->
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											href="/work/{item.slug}"
											target="_blank"
											rel="noopener noreferrer"
											variant="ghost"
											size="sm"
											class="font-bold text-muted-foreground hover:text-primary"
										>
											View
										</Button>

										<Button
											href="/admin/work/{item.id}/edit"
											variant="ghost"
											size="sm"
											class="font-bold text-muted-foreground hover:text-primary"
										>
											Edit
										</Button>

										<form
											id="delete-form-{item.id}"
											method="POST"
											action="?/delete"
											use:enhance
											class="hidden"
										>
											<input type="hidden" name="id" value={item.id} />
										</form>

										<Button
											type="button"
											variant="ghost"
											size="sm"
											onclick={() => promptDelete(item.id)}
											class="font-bold text-muted-foreground hover:text-destructive"
										>
											Delete
										</Button>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{:else}
				<div class="p-12 text-center text-muted-foreground">No work items created yet.</div>
			{/if}
		</CardContent>
	</Card>
</div>

<ConfirmDeleteDialog
	bind:open={confirmOpen}
	title="Delete Work Item"
	description="Are you sure you want to delete this project? This will also delete all associated gallery images."
	onConfirm={confirmDelete}
/>
