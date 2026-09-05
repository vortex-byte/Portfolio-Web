<script lang="ts">
	import Card from '../Card.svelte';
	import Input from '../Input.svelte';
	import Textarea from '../Textarea.svelte';
	import Button from '../Button.svelte';
	import Alert from '../Alert.svelte';
	import Icon from '../Icon.svelte';
	import { enhance } from '$app/forms';
	import { env as publicEnv } from '$env/dynamic/public';
	import { dev } from '$app/environment';

	let {
		eyebrow = "Let's Talk",
		title = "Have a project worth building? Let's talk.",
		description = 'Open to full-stack, backend, and IoT developer roles. I usually reply within 24 hours.',
		formState = null
	}: {
		eyebrow?: string | null;
		title?: string | null;
		description?: string | null;
		formState?: {
			success?: boolean;
			error?: string;
			errors?: Record<string, string>;
			values?: { name?: string; email?: string; message?: string };
		} | null;
	} = $props();

	let loading = $state(false);
	let nameVal = $state('');
	let emailVal = $state('');
	let messageVal = $state('');

	$effect(() => {
		if (formState?.values) {
			nameVal = formState.values.name ?? '';
			emailVal = formState.values.email ?? '';
			messageVal = formState.values.message ?? '';
		}
	});
</script>

<svelte:head>
	{#if !dev && publicEnv.PUBLIC_TURNSTILE_SITE_KEY}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

<section id="contact" class="border-b-[4px] border-black bg-white px-4 py-20 sm:px-6 lg:px-8">
	<div class="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-12">
		<!-- Left: Prompt & Info -->
		<div class="flex flex-col gap-6 lg:col-span-5">
			{#if eyebrow}
				<span
					class="inline-block w-fit rounded-[4px] border-2 border-black bg-[#FF3EA5] px-3 py-1 text-xs font-black tracking-wider text-white uppercase shadow-[2px_2px_0px_#000]"
				>
					{eyebrow}
				</span>
			{/if}
			{#if title}
				<h2 class="text-3xl font-black tracking-tight text-black uppercase sm:text-4xl lg:text-5xl">
					{title}
				</h2>
			{/if}
			{#if description}
				<p class="text-lg leading-relaxed font-medium text-neutral-800">
					{description}
				</p>
			{/if}

			<div class="flex flex-col gap-3 pt-4">
				<div class="flex items-center gap-3 text-base font-bold">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-[6px] border-2 border-black bg-[#FFD60A] text-black shadow-[2px_2px_0px_#000]"
					>
						<Icon name="Mail" size={20} />
					</div>
					<span>mzimam.ath@gmail.com</span>
				</div>
			</div>
		</div>

		<!-- Right: Contact Form -->
		<div class="lg:col-span-7">
			<Card bg="bg-[#FFF9EC]">
				{#if formState?.success}
					<Alert variant="success" title="Message Sent!">
						Thank you for getting in touch! Your message has been sent successfully. I will get back
						to you soon.
					</Alert>
				{:else}
					{#if formState?.error}
						<Alert variant="error" title="Submission Error" class="mb-6">
							{formState.error}
						</Alert>
					{/if}

					<form
						method="POST"
						action="/?/contact"
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
						class="flex flex-col gap-6"
					>
						<!-- Name -->
						<div class="flex flex-col gap-1.5">
							<label for="name" class="text-sm font-black tracking-wider text-black uppercase">
								Your Name <span class="text-red-600">*</span>
							</label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="Jane Doe"
								required
								bind:value={nameVal}
								error={formState?.errors?.name}
							/>
						</div>

						<!-- Email -->
						<div class="flex flex-col gap-1.5">
							<label for="email" class="text-sm font-black tracking-wider text-black uppercase">
								Your Email <span class="text-red-600">*</span>
							</label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="jane@example.com"
								required
								bind:value={emailVal}
								error={formState?.errors?.email}
							/>
						</div>

						<!-- Message -->
						<div class="flex flex-col gap-1.5">
							<label for="message" class="text-sm font-black tracking-wider text-black uppercase">
								Message <span class="text-red-600">*</span>
							</label>
							<Textarea
								id="message"
								name="message"
								rows={5}
								placeholder="Tell me about your project or inquiry..."
								required
								bind:value={messageVal}
								error={formState?.errors?.message}
							/>
						</div>

						{#if !dev && publicEnv.PUBLIC_TURNSTILE_SITE_KEY}
							<div class="cf-turnstile" data-sitekey={publicEnv.PUBLIC_TURNSTILE_SITE_KEY} data-theme="light"></div>
						{/if}

						<Button
							type="submit"
							variant="primary"
							size="lg"
							disabled={loading}
							class="mt-2 w-full"
						>
							{#if loading}
								<Icon name="Loader2" size={20} class="animate-spin" />
								<span>Sending Message...</span>
							{:else}
								<Icon name="Send" size={20} />
								<span>Send Message</span>
							{/if}
						</Button>
					</form>
				{/if}
			</Card>
		</div>
	</div>
</section>
