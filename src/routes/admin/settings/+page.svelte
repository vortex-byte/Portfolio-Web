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

	let smtp = $derived(data.smtp);
	let loading = $state(false);
	let testing = $state(false);
	let showPassword = $state(false);

	$effect(() => {
		if (form?.success) {
			toast.success('SMTP settings saved successfully!');
		} else if (form?.testSuccess) {
			toast.success('Test email sent successfully!');
		} else if (form?.error) {
			toast.error(form.error);
		} else if (form?.testError) {
			toast.error(`SMTP Test Failed: ${form.testError}`);
		}
	});
</script>

<AdminTitle title="SMTP Settings" />

<div class="max-w-4xl space-y-6">
	<div>
		<h1 class="text-3xl font-black tracking-tight">System Settings</h1>
		<p class="text-sm text-muted-foreground">
			Configure email SMTP credentials for contact form notifications.
		</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="text-lg font-bold">SMTP Mail Credentials</CardTitle>
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
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div class="space-y-2 sm:col-span-2">
						<Label for="host">SMTP Host</Label>
						<Input
							id="host"
							name="host"
							value={smtp?.host ?? ''}
							placeholder="e.g. smtp.mailtrap.io or smtp.gmail.com"
						/>
					</div>
					<div class="space-y-2">
						<Label for="port">SMTP Port</Label>
						<Input
							id="port"
							name="port"
							type="number"
							value={smtp?.port ?? 587}
							placeholder="587"
						/>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="user">SMTP Username / Email</Label>
						<Input id="user" name="user" value={smtp?.user ?? ''} placeholder="user@example.com" />
					</div>

					<div class="space-y-2">
						<Label for="pass">
							SMTP Password
							{#if smtp?.hasPass}
								<span class="text-xs font-normal text-muted-foreground">(Saved & Encrypted)</span>
							{/if}
						</Label>
						<div class="relative">
							<Input
								id="pass"
								name="pass"
								type={showPassword ? 'text' : 'password'}
								placeholder={smtp?.hasPass ? '••••••••' : 'Enter password...'}
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								<Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
							</button>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="fromName">Sender Name</Label>
						<Input
							id="fromName"
							name="fromName"
							value={smtp?.fromName ?? ''}
							placeholder="e.g. Portfolio Contact"
						/>
					</div>

					<div class="space-y-2">
						<Label for="fromEmail">Sender Email</Label>
						<Input
							id="fromEmail"
							name="fromEmail"
							type="email"
							value={smtp?.fromEmail ?? ''}
							placeholder="e.g. noreply@yourdomain.com"
						/>
					</div>
				</div>

				<div class="space-y-2 border-t pt-4">
					<Label for="targetEmail">Target Email</Label>
					<Input
						id="targetEmail"
						name="targetEmail"
						type="email"
						value={smtp?.targetEmail ?? ''}
						placeholder="where-to-receive-messages@example.com"
					/>
				</div>

				<!-- Actions -->
				<div class="flex items-center justify-between border-t pt-4">
					<Button
						size="lg"
						type="submit"
						formaction="?/test"
						variant="secondary"
						disabled={testing || loading}
					>
						{#if testing}
							<Icon name="Loader2" size={16} class="animate-spin" />
							<span>Sending Test Email...</span>
						{:else}
							<span>Send Test Email</span>
						{/if}
					</Button>

					<Button size="lg" type="submit" disabled={loading || testing}>
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
