<script lang="ts">
	import Button from '../Button.svelte';
	import Badge from '../Badge.svelte';
	import Icon from '../Icon.svelte';

	let {
		eyebrow = 'Full-Stack, Backend, IoT Developer',
		title = 'Full Stack Developer',
		description = 'Building fast, performant, and accessible web app experiences.',
		ctaPrimaryLabel = 'My Work',
		ctaPrimaryUrl = '/work',
		ctaSecondaryLabel = 'Contact Me',
		ctaSecondaryUrl = '/#contact',
		showPhoto = true,
		photo = null,
		photoAlt = 'Owner photo',
		photoZoom = 100
	}: {
		eyebrow?: string | null;
		title?: string;
		description?: string;
		ctaPrimaryLabel?: string | null;
		ctaPrimaryUrl?: string | null;
		ctaSecondaryLabel?: string | null;
		ctaSecondaryUrl?: string | null;
		showPhoto?: boolean;
		photo?: string | null;
		photoAlt?: string | null;
		photoZoom?: number | null;
	} = $props();
</script>

<section
	id="hero"
	class="relative overflow-hidden border-b-[4px] border-black bg-[#FFF9EC] px-4 py-16 sm:px-6 md:py-24 lg:px-8"
>
	<div class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
		<!-- Left: Text & CTAs -->
		<div class="flex flex-col items-start gap-6 {showPhoto ? 'lg:col-span-7' : 'lg:col-span-12'}">
			{#if eyebrow}
				<Badge variant="success" class="px-3 py-1 text-sm font-black">
					<Icon name="Zap" size={16} />
					<span>{eyebrow}</span>
				</Badge>
			{/if}

			<h1
				class="text-4xl leading-[1.1] font-black tracking-tight text-black uppercase sm:text-5xl lg:text-6xl"
			>
				{title}
			</h1>

			<p class="max-w-2xl text-lg leading-relaxed font-medium text-neutral-800 sm:text-xl">
				{description}
			</p>

			<div class="flex flex-wrap gap-4 pt-2">
				{#if ctaPrimaryLabel && ctaPrimaryUrl}
					<Button href={ctaPrimaryUrl} variant="primary" size="lg">
						<span>{ctaPrimaryLabel}</span>
						<Icon name="ArrowRight" size={20} />
					</Button>
				{/if}

				{#if ctaSecondaryLabel && ctaSecondaryUrl}
					<Button href={ctaSecondaryUrl} variant="outline" size="lg">
						<span>{ctaSecondaryLabel}</span>
					</Button>
				{/if}
			</div>
		</div>

		<!-- Right: Layered Photo & Sticker Composition -->
		{#if showPhoto}
			<div class="relative flex items-center justify-center lg:col-span-5">
				<div class="relative aspect-square w-72 sm:w-80 md:w-96">
					<!-- Layer 1: Background Decorative Block -->
					<div
						class="absolute inset-0 rotate-3 rounded-[12px] border-[4px] border-black bg-[#FF3EA5] shadow-[8px_8px_0px_#000000]"
					></div>

					<!-- Layer 2: Main Photo Card -->
					<div
						class="absolute inset-0 flex -rotate-2 items-center justify-center overflow-hidden rounded-[12px] border-[4px] border-black bg-white shadow-[8px_8px_0px_#000000]"
					>
						{#if photo}
							<img
								src={photo}
								alt={photoAlt || 'Owner photo'}
								class="h-full w-auto object-contain grayscale"
								style="transform: scale({(photoZoom ?? 100) / 100});"
							/>
						{:else}
							<div
								class="flex h-full w-full flex-col items-center justify-center bg-[#FFD60A] p-6 text-center"
							>
								<Icon name="User" size={80} class="mb-2 text-black" />
								<span class="text-2xl font-black tracking-wider uppercase"
									>Full Stack Developer</span
								>
							</div>
						{/if}
					</div>

					<!-- Layer 3: Rotated Sticker Badges -->
					<div
						class="absolute -top-4 -left-4 z-20 flex -rotate-12 items-center gap-1.5 rounded-[6px] border-[3px] border-black bg-[#4EA8DE] px-3.5 py-1.5 text-xs font-black tracking-wider text-white uppercase shadow-[3px_3px_0px_#000]"
					>
						<Icon name="CodeXml" size={16} />
						<span>Full Stack</span>
					</div>

					<div
						class="absolute -right-4 -bottom-4 z-20 flex rotate-6 items-center gap-1.5 rounded-[6px] border-[3px] border-black bg-[#7AE582] px-4 py-2 text-sm font-black tracking-wider text-black uppercase shadow-[3px_3px_0px_#000]"
					>
						<Icon name="Sparkles" size={18} />
						<span>Eat > Work > Sleep</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>
