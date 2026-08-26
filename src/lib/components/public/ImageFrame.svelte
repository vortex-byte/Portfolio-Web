<script lang="ts">
	let {
		src,
		alt = '',
		class: className = '',
		aspect = 'aspect-video',
		objectFit = 'object-cover'
	}: {
		src: string;
		alt?: string;
		class?: string;
		aspect?: string;
		objectFit?: 'object-cover' | 'object-contain' | 'object-fill';
	} = $props();
</script>

<div
	class="relative flex items-center justify-center overflow-hidden rounded-[6px] border-[3px] border-black bg-white shadow-[4px_4px_0px_#000000] {className}"
>
	<img
		{src}
		{alt}
		class="h-full max-h-[400px] w-auto {aspect} {objectFit} display-block"
		loading="lazy"
	/>
</div>
