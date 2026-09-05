<script lang="ts">
	import { env as publicEnv } from '$env/dynamic/public';
	import Hero from '$lib/components/public/sections/Hero.svelte';
	import About from '$lib/components/public/sections/About.svelte';
	import Services from '$lib/components/public/sections/Services.svelte';
	import Skills from '$lib/components/public/sections/Skills.svelte';
	import WorkSection from '$lib/components/public/sections/Work.svelte';
	import ContactFormSection from '$lib/components/public/sections/ContactForm.svelte';
	import type { WorkItem } from '$lib/components/public/sections/Work.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Full-Stack, Backend, IoT Developer | {publicEnv.PUBLIC_SITE_TITLE || 'BuildWithZimam'}</title>
</svelte:head>

<!-- Hero Section -->
{#if data.sectionHeaders?.hero?.isVisible !== false}
	<Hero
		eyebrow={data.sectionHeaders?.hero?.eyebrow}
		title={data.hero?.title}
		description={data.hero?.description}
		ctaPrimaryLabel={data.hero?.ctaPrimaryLabel}
		ctaPrimaryUrl={data.hero?.ctaPrimaryUrl}
		ctaSecondaryLabel={data.hero?.ctaSecondaryLabel}
		ctaSecondaryUrl={data.hero?.ctaSecondaryUrl}
		showPhoto={data.hero?.showPhoto}
		photo={data.hero?.photoPath}
		photoAlt={data.hero?.photoAlt}
		photoZoom={data.hero?.photoZoom}
	/>
{/if}

<!-- About Section -->
{#if data.sectionHeaders?.about?.isVisible !== false && data.about?.content}
	<About
		eyebrow={data.sectionHeaders?.about?.eyebrow}
		title={data.sectionHeaders?.about?.title}
		content={data.about.content}
	/>
{/if}

<!-- Services Section ("What I Can Do") -->
{#if data.sectionHeaders?.services?.isVisible !== false}
	<Services
		eyebrow={data.sectionHeaders?.services?.eyebrow}
		title={data.sectionHeaders?.services?.title}
		items={data.services}
	/>
{/if}

<!-- Skills Section -->
{#if data.sectionHeaders?.skills?.isVisible !== false}
	<Skills
		eyebrow={data.sectionHeaders?.skills?.eyebrow}
		title={data.sectionHeaders?.skills?.title}
		items={data.skills}
	/>
{/if}

<!-- Work Section ("My Work" - 3 Pinned Items) -->
{#if data.sectionHeaders?.work?.isVisible !== false}
	<WorkSection
		eyebrow={data.sectionHeaders?.work?.eyebrow}
		title={data.sectionHeaders?.work?.title}
		items={data.pinnedWork.map((item) => ({
			id: item.id,
			slug: item.slug,
			title: item.title,
			shortDescription: item.shortDescription,
			coverImage: item.coverImagePath,
			coverImageAlt: item.coverImageAlt,
			techStack: item.techStack
		})) satisfies WorkItem[]}
	/>
{/if}

<!-- Contact Section -->
{#if data.sectionHeaders?.contact?.isVisible !== false}
	<ContactFormSection
		eyebrow={data.sectionHeaders?.contact?.eyebrow}
		title={data.sectionHeaders?.contact?.title}
		description={data.sectionHeaders?.contact?.description}
		formState={form}
	/>
{/if}
