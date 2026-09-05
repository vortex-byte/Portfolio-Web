<script lang="ts">
	import type { ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import { enhance } from '$app/forms';
	import { env as publicEnv } from '$env/dynamic/public';
	import { dev } from '$app/environment';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let email = $state('');
	let password = $state('');

	$effect(() => {
		if (form?.values?.email) {
			email = form.values.email;
		}
	});
</script>

<svelte:head>
	{#if !dev && publicEnv.PUBLIC_TURNSTILE_SITE_KEY}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

<AdminTitle title="Admin Login" />

<Card class="w-full max-w-md py-6 shadow-2xl">
	<CardHeader class="space-y-2 pb-6 text-center">
		<CardTitle class="text-2xl font-bold tracking-tight">Admin Login</CardTitle>
		<CardDescription>Enter the credentials to access the dashboard</CardDescription>
	</CardHeader>

	<CardContent>
		{#if form?.error}
			<div
				class="mb-6 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
			>
				<Icon name="CircleAlert" size={18} class="mt-0.5 shrink-0" />
				<span>{form.error}</span>
			</div>
		{/if}

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
					if (typeof window !== 'undefined' && (window as any).turnstile) {
						(window as any).turnstile.reset();
					}
				};
			}}
			class="space-y-5"
		>
			<div class="space-y-2">
				<Label for="email" class="font-medium">Email Address</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="admin@example.com"
					required
					bind:value={email}
				/>
			</div>

			<div class="space-y-2">
				<Label for="password" class="font-medium">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder="••••••••"
					required
					bind:value={password}
				/>
			</div>

			{#if !dev && publicEnv.PUBLIC_TURNSTILE_SITE_KEY}
				<div class="cf-turnstile flex justify-center" data-sitekey={publicEnv.PUBLIC_TURNSTILE_SITE_KEY} data-theme="light"></div>
			{/if}

			<Button type="submit" disabled={loading} class="h-11 w-full cursor-pointer font-bold">
				{#if loading}
					<Icon name="Loader2" size={18} class="animate-spin" />
					<span>Authenticating...</span>
				{:else}
					<span>Sign In</span>
				{/if}
			</Button>
		</form>
	</CardContent>
</Card>
