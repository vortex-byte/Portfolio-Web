<script lang="ts">
	import Icon from './Icon.svelte';

	interface SocialLink {
		platform: string;
		url: string;
		icon: string;
	}

	let {
		copyrightText = '© 2026 Developer Portfolio. All rights reserved.',
		socialLinks = []
	}: {
		copyrightText?: string | null;
		socialLinks?: SocialLink[] | null;
	} = $props();
</script>

<footer class="border-t-[4px] border-black bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
	<div
		class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left"
	>
		<!-- Left: Copyright -->
		<div class="flex flex-col gap-2">
			<p class="text-sm font-medium text-neutral-300">
				{copyrightText}
			</p>
		</div>

		<!-- Right: Social Links -->
		{#if socialLinks && socialLinks.length > 0}
			<div class="flex flex-wrap items-center justify-center gap-3">
				{#each socialLinks as link (link.platform)}
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={link.platform}
						class="inline-flex items-center gap-2 rounded-[6px] border-[2.5px] border-white bg-neutral-900 px-3.5 py-2 text-sm font-bold text-white shadow-[3px_3px_0px_#FFFFFF] transition-all hover:bg-[#FF3EA5] hover:text-white hover:shadow-[3px_3px_0px_#FFD60A] active:translate-x-0.5 active:translate-y-0.5"
					>
						<Icon name={link.icon} size={18} />
						<span>{link.platform}</span>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</footer>
