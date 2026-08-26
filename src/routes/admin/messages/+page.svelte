<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import Icon from '$lib/components/public/Icon.svelte';
	import ConfirmDeleteDialog from '$lib/components/admin/ConfirmDeleteDialog.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
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

	interface MessageItem {
		id: string;
		name: string;
		email: string;
		message: string;
		ipAddress: string | null;
		isRead: boolean;
		createdAt: Date;
	}

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let sectionHeader = $derived(data.sectionHeader);
	let messages = $derived(data.messageData.items);
	let currentPage = $derived(data.messageData.page);
	let totalPages = $derived(data.messageData.totalPages);
	let totalCount = $derived(data.messageData.totalCount);

	let selectedMessage = $state<MessageItem | null>(null);
	let detailOpen = $state(false);
	let confirmOpen = $state(false);
	let deleteId = $state<string | null>(null);

	$effect(() => {
		if (form?.headerSuccess) {
			toast.success('Section header updated successfully!');
		} else if (form?.success) {
			toast.success('Messages updated!');
			confirmOpen = false;
			deleteId = null;
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	function viewMessage(msg: MessageItem) {
		selectedMessage = msg;
		detailOpen = true;

		if (!msg.isRead) {
			const formEl = document.getElementById(`mark-read-form-${msg.id}`) as HTMLFormElement;
			if (formEl) formEl.requestSubmit();
		}
	}

	function promptDelete(id: string) {
		deleteId = id;
		confirmOpen = true;
	}

	function confirmDelete() {
		if (!deleteId) return;
		const formEl = document.getElementById(`delete-msg-${deleteId}`) as HTMLFormElement;
		if (formEl) formEl.requestSubmit();
	}
</script>

<AdminTitle title="Contact Messages" />

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-black tracking-tight">Contact Messages</h1>
		<p class="text-sm text-muted-foreground">
			View inquiries submitted through the public website contact form.
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
						value={sectionHeader?.eyebrow ?? "Let's Talk"}
						placeholder="e.g. Let's Talk"
					/>
				</div>
				<div class="space-y-2">
					<Label for="header-title">Section Headline</Label>
					<Input
						id="header-title"
						name="title"
						value={sectionHeader?.title ?? "Have a project worth building? Let's talk."}
						placeholder="e.g. Have a project worth building? Let's talk."
					/>
				</div>
			</div>
			<div class="space-y-2">
				<Label for="header-description">Section Description</Label>
				<Textarea
					id="header-description"
					name="description"
					rows={2}
					value={sectionHeader?.description ??
						'Open to full-stack, backend, and IoT developer roles. I usually reply within 24 hours.'}
					placeholder="Short prompt for potential clients..."
				/>
			</div>
			<div class="flex justify-end">
				<Button type="submit" size="sm" variant="outline">Save Header Settings</Button>
			</div>
		</form>
	</Card>

	<!-- Data Table -->
	<Card>
		<CardContent class="p-0">
			{#if messages.length > 0}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead class="w-24">Status</TableHead>
							<TableHead>Sender</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Message Snippet</TableHead>
							<TableHead class="w-36">Received</TableHead>
							<TableHead class="w-24 text-right"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each messages as msg (msg.id)}
							<!-- Hidden mark-read form -->
							<form
								id="mark-read-form-{msg.id}"
								method="POST"
								action="?/markRead"
								use:enhance
								class="hidden"
							>
								<input type="hidden" name="id" value={msg.id} />
								<input type="hidden" name="isRead" value="true" />
							</form>

							<TableRow
								onclick={() => viewMessage(msg)}
								class="cursor-pointer {msg.isRead ? '' : 'bg-muted/40 font-bold'}"
							>
								<TableCell>
									<Badge variant={msg.isRead ? 'secondary' : 'default'}>
										{msg.isRead ? 'Read' : 'New'}
									</Badge>
								</TableCell>
								<TableCell class="font-bold">{msg.name}</TableCell>
								<TableCell class="font-mono text-xs text-muted-foreground">{msg.email}</TableCell>
								<TableCell class="max-w-xs truncate text-sm text-muted-foreground">
									{msg.message}
								</TableCell>
								<TableCell class="font-mono text-xs text-muted-foreground">
									{new Date(msg.createdAt).toLocaleString()}
								</TableCell>
								<TableCell class="text-right" onclick={(e) => e.stopPropagation()}>
									<div class="flex items-center justify-end gap-1">
										<form
											id="delete-msg-{msg.id}"
											method="POST"
											action="?/delete"
											use:enhance
											class="hidden"
										>
											<input type="hidden" name="id" value={msg.id} />
										</form>

										<Button
											variant="ghost"
											size="sm"
											onclick={() => promptDelete(msg.id)}
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

				{#if totalPages > 1}
					<div class="flex items-center justify-between border-t px-6 py-4">
						<span class="text-xs font-semibold text-muted-foreground">
							Showing page {currentPage} of {totalPages} ({totalCount} total inquiries)
						</span>

						<div class="flex items-center gap-2">
							{#if currentPage > 1}
								<Button
									href="/admin/messages?page={currentPage - 1}"
									variant="outline"
									size="sm"
									class="gap-1"
								>
									<Icon name="ChevronLeft" size={16} />
									<span>Previous</span>
								</Button>
							{:else}
								<Button variant="outline" size="sm" disabled class="gap-1">
									<Icon name="ChevronLeft" size={16} />
									<span>Previous</span>
								</Button>
							{/if}

							<span class="px-2 font-mono text-xs font-bold text-muted-foreground">
								{currentPage} / {totalPages}
							</span>

							{#if currentPage < totalPages}
								<Button
									href="/admin/messages?page={currentPage + 1}"
									variant="outline"
									size="sm"
									class="gap-1"
								>
									<span>Next</span>
									<Icon name="ChevronRight" size={16} />
								</Button>
							{:else}
								<Button variant="outline" size="sm" disabled class="gap-1">
									<span>Next</span>
									<Icon name="ChevronRight" size={16} />
								</Button>
							{/if}
						</div>
					</div>
				{/if}
			{:else}
				<div class="p-12 text-center text-muted-foreground">No contact messages received yet.</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Message Detail Modal -->
{#if selectedMessage}
	<Dialog bind:open={detailOpen}>
		<DialogContent size="2xl">
			<DialogHeader>
				<DialogTitle class="flex items-center justify-between text-xl font-bold">
					<span>Inquiry</span>
				</DialogTitle>
			</DialogHeader>

			<div class="space-y-4 pt-2">
				<div class="flex flex-col gap-1 rounded-lg border bg-muted/40 p-3 text-sm">
					<div>
						<span class="font-semibold text-muted-foreground">From:</span>
						<span class="ml-1 font-bold">{selectedMessage.name}</span>
					</div>
					<div>
						<span class="font-semibold text-muted-foreground">Reply-To Email:</span>
						<a
							href="mailto:{selectedMessage.email}"
							class="ml-1 font-mono font-semibold text-primary hover:underline"
						>
							{selectedMessage.email}
						</a>
					</div>
					<div class="text-muted-foreground">
						<span class="font-semibold text-muted-foreground">Time:</span>
						<span class="ml-1"
							>{new Date(selectedMessage.createdAt).toLocaleTimeString('id-ID', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
								hour12: false
							})}</span
						>
					</div>
					{#if selectedMessage.ipAddress}
						<div class="pt-1 font-mono text-xs text-muted-foreground">
							IP Address: {selectedMessage.ipAddress}
						</div>
					{/if}
				</div>

				<div
					class="rounded-lg border bg-muted/20 p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap"
				>
					{selectedMessage.message}
				</div>
			</div>

			<DialogFooter class="pt-4 md:gap-2">
				<Button
					type="button"
					variant="destructive"
					size="lg"
					onclick={() => selectedMessage && promptDelete(selectedMessage.id)}
				>
					<span>Delete Message</span>
				</Button>

				<Button size="lg" href="mailto:{selectedMessage.email}">
					<span>Reply via Email</span>
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
{/if}

<ConfirmDeleteDialog
	bind:open={confirmOpen}
	title="Delete Contact Message"
	description="Are you sure you want to delete this message? This action cannot be undone."
	onConfirm={confirmDelete}
/>
