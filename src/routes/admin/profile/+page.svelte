<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let user = $derived(data.user);
	let loading = $state(false);

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	$effect(() => {
		if (form?.success) {
			toast.success('Profile settings updated successfully!');
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<AdminTitle title="Profile Settings" />

<div class="max-w-3xl space-y-6">
	<div>
		<h1 class="text-3xl font-black tracking-tight">Profile Settings</h1>
		<p class="text-sm text-muted-foreground">
			Manage your admin name, email address, and security password.
		</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">Admin Account Credentials</CardTitle>
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update({ reset: false });
					};
				}}
				class="space-y-6"
			>
				<!-- Name & Email -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Display Name *</Label>
						<Input
							id="name"
							name="name"
							value={user?.name ?? ''}
							required
							placeholder="e.g. Admin"
						/>
					</div>

					<div class="space-y-2">
						<Label for="email">Admin Email Address *</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={user?.email ?? ''}
							required
							placeholder="admin@example.com"
						/>
					</div>
				</div>

				<!-- Change Password Section -->
				<div class="space-y-4 border-t pt-4">
					<h3 class="text-sm font-bold tracking-wide text-foreground uppercase">
						Change Password & Confirm Verification
					</h3>
					<p class="text-xs text-muted-foreground">
						Enter your current password to confirm changes to your email address or password.
					</p>

					<div class="space-y-2">
						<Label for="currentPassword">Current Password</Label>
						<Input
							id="currentPassword"
							name="currentPassword"
							type="password"
							bind:value={currentPassword}
							placeholder="••••••••"
						/>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="newPassword">New Password (optional)</Label>
							<Input
								id="newPassword"
								name="newPassword"
								type="password"
								bind:value={newPassword}
								placeholder="Min 8 characters"
							/>
						</div>

						<div class="space-y-2">
							<Label for="confirmPassword">Confirm New Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								placeholder="Confirm new password"
							/>
						</div>
					</div>
				</div>

				<!-- Submit Button -->
				<div class="flex justify-end pt-4">
					<Button type="submit" size="lg" disabled={loading}>
						{#if loading}
							<Icon name="Loader2" size={16} class="animate-spin" />
							<span>Saving...</span>
						{:else}
							<span>Save Profile Settings</span>
						{/if}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
