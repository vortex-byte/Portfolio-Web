<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import IconPicker from '$lib/components/admin/IconPicker.svelte';
	import ConfirmDeleteDialog from '$lib/components/admin/ConfirmDeleteDialog.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
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
		title: string;
		description: string;
		icon: string | null;
	} | null>(null);

	let createIcon = $state('PanelsTopLeft');
	let editIcon = $state('PanelsTopLeft');

	$effect(() => {
		if (form?.headerSuccess) {
			toast.success('Section header updated successfully!');
		} else if (form?.success) {
			toast.success('Services updated successfully!');
			createOpen = false;
			editOpen = false;
			confirmOpen = false;
			deleteId = null;
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	function openEdit(item: { id: string; title: string; description: string; icon: string | null }) {
		editItem = item;
		editIcon = item.icon || 'PanelsTopLeft';
		editOpen = true;
	}

	function promptDelete(id: string) {
		deleteId = id;
		confirmOpen = true;
	}

	function confirmDelete() {
		if (!deleteId) return;
		const formEl = document.getElementById(`delete-service-${deleteId}`) as HTMLFormElement;
		if (formEl) formEl.requestSubmit();
	}
</script>

<AdminTitle title="Manage Services" />

<div class="space-y-6">
	<div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
		<div>
			<h1 class="text-3xl font-black tracking-tight">What I Can Do</h1>
			<p class="text-sm text-muted-foreground">
				Manage your service offering cards, Lucide icons, and descriptions displayed on your
				homepage.
			</p>
		</div>

		<Button onclick={() => (createOpen = true)}>
			<Icon name="Plus" size={18} />
			<span>Add Service</span>
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
						value={sectionHeader?.eyebrow ?? 'Services & Offerings'}
						placeholder="e.g. Services & Offerings"
					/>
				</div>
				<div class="space-y-2">
					<Label for="header-title">Section Title</Label>
					<Input
						id="header-title"
						name="title"
						value={sectionHeader?.title ?? 'What I Can Do'}
						placeholder="e.g. What I Can Do"
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
							<TableHead>Title</TableHead>
							<TableHead>Description</TableHead>
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
								<TableCell class="font-bold">{item.title}</TableCell>
								<TableCell class="max-w-md truncate text-sm text-muted-foreground">
									{item.description}
								</TableCell>
								<TableCell>
									<form method="POST" action="?/toggleVisibility" use:enhance>
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
											id="delete-service-{item.id}"
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
				<div class="p-12 text-center text-muted-foreground">No service items created yet.</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Create Dialog -->
<Dialog bind:open={createOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle class="text-xl font-bold">Add Service</DialogTitle>
		</DialogHeader>
		<form method="POST" action="?/create" use:enhance class="space-y-4 pt-2">
			<div class="space-y-2">
				<Label for="title">Title *</Label>
				<Input id="title" name="title" required placeholder="e.g. Frontend Development" />
			</div>

			<div class="space-y-2">
				<Label for="description">Description *</Label>
				<Textarea
					id="description"
					name="description"
					required
					rows={3}
					placeholder="Short summary of service..."
				/>
			</div>

			<div class="space-y-2">
				<Label>Lucide Icon</Label>
				<IconPicker bind:value={createIcon} name="icon" />
			</div>

			<DialogFooter class="pt-4">
				<Button size="lg" type="submit">Add Service</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<!-- Edit Dialog -->
{#if editItem}
	<Dialog bind:open={editOpen}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle class="text-xl font-bold">Edit Service Card</DialogTitle>
			</DialogHeader>
			<form method="POST" action="?/update" use:enhance class="space-y-4 pt-2">
				<input type="hidden" name="id" value={editItem.id} />

				<div class="space-y-2">
					<Label for="edit-title">Title *</Label>
					<Input id="edit-title" name="title" value={editItem.title} required />
				</div>

				<div class="space-y-2">
					<Label for="edit-description">Description *</Label>
					<Textarea
						id="edit-description"
						name="description"
						value={editItem.description}
						required
						rows={3}
					/>
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
	title="Delete Service"
	description="Are you sure you want to delete this service offering?"
	onConfirm={confirmDelete}
/>
