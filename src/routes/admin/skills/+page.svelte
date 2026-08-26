<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import IconPicker from '$lib/components/admin/IconPicker.svelte';
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
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let items = $derived(data.items);
	let sectionHeader = $derived(data.sectionHeader);

	let createOpen = $state(false);
	let editOpen = $state(false);
	let confirmOpen = $state(false);
	let deleteId = $state<string | null>(null);

	let editItem = $state<{
		id: string;
		name: string;
		category: string | null;
		icon: string | null;
		proficiency: number | null;
	} | null>(null);

	let createIcon = $state('CodeXml');
	let editIcon = $state('CodeXml');

	$effect(() => {
		if (form?.headerSuccess) {
			toast.success('Section header updated successfully!');
		} else if (form?.success) {
			toast.success('Skills updated successfully!');
			createOpen = false;
			editOpen = false;
			confirmOpen = false;
			deleteId = null;
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	function openEdit(item: {
		id: string;
		name: string;
		category: string | null;
		icon: string | null;
		proficiency: number | null;
	}) {
		editItem = item;
		editIcon = item.icon || 'CodeXml';
		editOpen = true;
	}

	function promptDelete(id: string) {
		deleteId = id;
		confirmOpen = true;
	}

	function confirmDelete() {
		if (!deleteId) return;
		const formEl = document.getElementById(`delete-skill-${deleteId}`) as HTMLFormElement;
		if (formEl) formEl.requestSubmit();
	}
</script>

<AdminTitle title="Manage Skills" />

<div class="space-y-6">
	<div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-black tracking-tight">Skills & Tech Stack</h1>
			<p class="text-sm text-muted-foreground">
				Manage your technology skills, icons, category groupings, and optional proficiency levels.
			</p>
		</div>

		<Button onclick={() => (createOpen = true)}>
			<Icon name="Plus" size={18} />
			<span>Add Skill</span>
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
						value={sectionHeader?.eyebrow ?? 'Tooling & Tech'}
						placeholder="e.g. Tooling & Tech"
					/>
				</div>
				<div class="space-y-2">
					<Label for="header-title">Section Title</Label>
					<Input
						id="header-title"
						name="title"
						value={sectionHeader?.title ?? 'Skills & Expertise'}
						placeholder="e.g. Skills & Expertise"
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
							<TableHead class="w-16">Icon</TableHead>
							<TableHead>Skill Name</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Proficiency</TableHead>
							<TableHead class="w-28">Visible</TableHead>
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
									<div class="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
										<Icon name={item.icon} size={20} />
									</div>
								</TableCell>
								<TableCell class="font-bold">{item.name}</TableCell>
								<TableCell>
									<Badge variant="secondary">
										{item.category || 'General'}
									</Badge>
								</TableCell>
								<TableCell class="font-mono text-sm text-muted-foreground">
									{item.proficiency !== null ? `${item.proficiency}%` : 'N/A'}
								</TableCell>
								<TableCell>
									<form method="POST" action="?/toggleVisibility" use:enhance>
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="isVisible" value={(!item.isVisible).toString()} />
										<Switch
											checked={item.isVisible}
											onCheckedChange={() => {
												const form = document.getElementById(
													`vis-skill-${item.id}`
												) as HTMLFormElement;
												if (form) form.requestSubmit();
											}}
										/>
									</form>
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end">
										<Button
											variant="ghost"
											size="sm"
											onclick={() => openEdit(item)}
											class="font-bold text-muted-foreground hover:text-primary"
										>
											Edit
										</Button>

										<form
											id="delete-skill-{item.id}"
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
				<div class="p-12 text-center text-muted-foreground">No skills created yet.</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Create Dialog -->
<Dialog bind:open={createOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle class="text-xl font-bold">Add Skill</DialogTitle>
		</DialogHeader>
		<form method="POST" action="?/create" use:enhance class="space-y-4 pt-2">
			<div class="space-y-2">
				<Label for="name">Skill Name *</Label>
				<Input id="name" name="name" required placeholder="e.g. SvelteKit" />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="category">Category</Label>
					<Input id="category" name="category" placeholder="Frontend / Backend / Tools" />
				</div>
				<div class="space-y-2">
					<Label for="proficiency">Proficiency (0-100%)</Label>
					<Input
						id="proficiency"
						name="proficiency"
						type="number"
						min="0"
						max="100"
						placeholder="85"
					/>
				</div>
			</div>

			<div class="space-y-2">
				<Label>Lucide Icon</Label>
				<IconPicker bind:value={createIcon} name="icon" />
			</div>

			<DialogFooter class="pt-4">
				<Button size="lg" type="submit">Add Skill</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<!-- Edit Dialog -->
{#if editItem}
	<Dialog bind:open={editOpen}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle class="text-xl font-bold">Edit Skill</DialogTitle>
			</DialogHeader>
			<form method="POST" action="?/update" use:enhance class="space-y-4 pt-2">
				<input type="hidden" name="id" value={editItem.id} />

				<div class="space-y-2">
					<Label for="edit-name">Skill Name *</Label>
					<Input id="edit-name" name="name" value={editItem.name} required />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="edit-category">Category</Label>
						<Input id="edit-category" name="category" value={editItem.category ?? ''} />
					</div>
					<div class="space-y-2">
						<Label for="edit-proficiency">Proficiency (%)</Label>
						<Input
							id="edit-proficiency"
							name="proficiency"
							type="number"
							min="0"
							max="100"
							value={editItem.proficiency ?? ''}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label>Lucide Icon</Label>
					<IconPicker bind:value={editIcon} name="icon" />
				</div>

				<DialogFooter class="pt-4">
					<Button size="lg" type="submit">Save Changes</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
{/if}

<ConfirmDeleteDialog
	bind:open={confirmOpen}
	title="Delete Skill"
	description="Are you sure you want to delete this skill tag?"
	onConfirm={confirmDelete}
/>
