<script lang="ts">
	import Icon from './Icon.svelte';

	export interface CarouselImage {
		id?: string;
		image: string;
		imageAlt?: string | null;
	}

	let {
		images = [],
		class: className = ''
	}: {
		images: CarouselImage[];
		class?: string;
	} = $props();

	let currentIndex = $state(0);
	let modalOpen = $state(false);

	$effect(() => {
		if (currentIndex >= images.length && images.length > 0) {
			currentIndex = 0;
		}
	});

	function prev(e?: Event) {
		e?.stopPropagation();
		if (images.length === 0) return;
		currentIndex = (currentIndex - 1 + images.length) % images.length;
	}

	function next(e?: Event) {
		e?.stopPropagation();
		if (images.length === 0) return;
		currentIndex = (currentIndex + 1) % images.length;
	}

	function goTo(index: number) {
		currentIndex = index;
	}

	function openModal() {
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
		if (e.key === 'Escape' && modalOpen) closeModal();
	}
</script>

{#if images.length > 0}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="relative flex flex-col gap-4 {className}"
		role="region"
		aria-label="Image gallery carousel"
		aria-live="polite"
		onkeydown={handleKeyDown}
		tabindex={0}
	>
		<!-- Main Display Frame -->
		<div
			onclick={openModal}
			role="button"
			tabindex={0}
			onkeydown={(e) => e.key === 'Enter' && openModal()}
			class="group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-[6px] border-[3px] border-black bg-black shadow-[6px_6px_0px_#000000]"
		>
			<img
				src={images[currentIndex].image}
				alt={images[currentIndex].imageAlt || `Gallery image ${currentIndex + 1}`}
				class="h-full w-full object-cover transition-all duration-200 group-hover:scale-102"
			/>

			<!-- Zoom overlay prompt on hover -->
			<div
				class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<div
					class="flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD60A] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000]"
				>
					<Icon name="Maximize2" size={16} />
					<span>Click to enlarge</span>
				</div>
			</div>

			{#if images.length > 1}
				<!-- Nav Buttons -->
				<button
					onclick={(e) => prev(e)}
					type="button"
					aria-label="Previous image"
					class="absolute top-1/2 left-3 z-10 -translate-y-1/2 cursor-pointer rounded-full border-2 border-black bg-[#FFD60A] p-2.5 text-black shadow-[2px_2px_0px_#000000] transition-all hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
				>
					<Icon name="ChevronLeft" size={24} />
				</button>
				<button
					onclick={(e) => next(e)}
					type="button"
					aria-label="Next image"
					class="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded-full border-2 border-black bg-[#FFD60A] p-2.5 text-black shadow-[2px_2px_0px_#000000] transition-all hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
				>
					<Icon name="ChevronRight" size={24} />
				</button>

				<!-- Index indicator counter pill -->
				<div
					class="absolute right-3 bottom-3 rounded-full border-2 border-white bg-black px-2.5 py-1 font-mono text-xs font-bold text-white shadow-[2px_2px_0px_#000]"
				>
					{currentIndex + 1} / {images.length}
				</div>
			{/if}
		</div>

		<!-- Thumbnail Indicators -->
		{#if images.length > 1}
			<div class="flex gap-2 overflow-x-auto px-1 pt-1 pb-2">
				{#each images as img, idx (img.id || idx)}
					<button
						onclick={() => goTo(idx)}
						type="button"
						aria-label={`Go to slide ${idx + 1}`}
						class="relative h-12 w-16 shrink-0 cursor-pointer overflow-hidden rounded-[4px] border-2 transition-all {currentIndex ===
						idx
							? 'scale-105 border-black shadow-[3px_3px_0px_#000000] ring-2 ring-[#FFD60A]'
							: 'border-neutral-400 opacity-60 hover:opacity-100'}"
					>
						<img
							src={img.image}
							alt={img.imageAlt || `Thumbnail ${idx + 1}`}
							class="h-full w-full object-cover"
						/>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Fullscreen Popup Lightbox Modal -->
	{#if modalOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={closeModal}
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
		>
			<div
				onclick={(e) => e.stopPropagation()}
				class="relative flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-[8px] border-[3px] border-black bg-white shadow-[8px_8px_0px_#000000]"
			>
				<!-- Modal Header Bar -->
				<div class="flex items-center justify-between border-b-[3px] border-black bg-[#FFD60A] p-4">
					<div
						class="rounded-full border-2 border-black bg-white px-3 py-1 font-mono text-xs font-black text-black shadow-[2px_2px_0px_#000]"
					>
						{currentIndex + 1} / {images.length}
					</div>
					<button
						type="button"
						onclick={closeModal}
						class="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-[#FF3EA5] hover:text-white"
					>
						<Icon name="X" size={18} />
					</button>
				</div>

				<!-- Modal Image Content -->
				<div
					class="relative flex min-h-[300px] flex-1 items-center justify-center bg-neutral-900 p-4"
				>
					<img
						src={images[currentIndex].image}
						alt={images[currentIndex].imageAlt || `Enlarged view ${currentIndex + 1}`}
						class="max-h-[70vh] w-auto max-w-full rounded border-2 border-black object-contain shadow-[4px_4px_0px_#000000]"
					/>

					{#if images.length > 1}
						<button
							onclick={(e) => prev(e)}
							type="button"
							class="absolute top-1/2 left-4 z-10 -translate-y-1/2 cursor-pointer rounded-full border-2 border-black bg-[#FFD60A] p-3 text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
						>
							<Icon name="ChevronLeft" size={28} />
						</button>
						<button
							onclick={(e) => next(e)}
							type="button"
							class="absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer rounded-full border-2 border-black bg-[#FFD60A] p-3 text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
						>
							<Icon name="ChevronRight" size={28} />
						</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{:else}
	<div
		class="flex aspect-video items-center justify-center rounded-[6px] border-[3px] border-black bg-neutral-100 font-semibold text-neutral-500 shadow-[4px_4px_0px_#000000]"
	>
		No gallery images available
	</div>
{/if}
