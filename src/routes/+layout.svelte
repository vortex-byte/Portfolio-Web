<script lang="ts">
	import './layout.css';
	import Navbar from '$lib/components/public/Navbar.svelte';
	import Footer from '$lib/components/public/Footer.svelte';
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children?: Snippet } = $props();

	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-scroll', isAdmin ? 'auto' : 'smooth');
		}
	});
</script>

<svelte:head>
	<title>{env.PUBLIC_SITE_TITLE || 'BuildWithZimam'}</title>
	<meta name="description" content={env.PUBLIC_SITE_DESCRIPTION || ''} />
	<meta property="og:title" content={env.PUBLIC_SITE_TITLE || 'BuildWithZimam'} />
	<meta property="og:description" content={env.PUBLIC_SITE_DESCRIPTION || ''} />
	<script>
		document.documentElement.setAttribute(
			'data-scroll',
			location.pathname.startsWith('/admin') ? 'auto' : 'smooth'
		);
	</script>
</svelte:head>

{#if isAdmin}
	{@render children?.()}
{:else}
	<div
		class="flex min-h-screen flex-col bg-[#FFF9EC] font-sans text-[#111111] selection:bg-[#FFD60A] selection:text-black"
	>
		<Navbar siteTitle={env.PUBLIC_SITE_TITLE || 'BuildWithZimam'} />

		<main class="flex-1">
			{@render children?.()}
		</main>

		<Footer
			copyrightText={data.footer?.copyrightText}
			socialLinks={data.footer?.socialLinks as unknown as {
				platform: string;
				url: string;
				icon: string;
			}[]}
		/>
	</div>
{/if}
