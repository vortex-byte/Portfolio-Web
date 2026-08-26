<script lang="ts">
	import Icon from './Icon.svelte';
	import Button from './Button.svelte';

	let { siteTitle = 'BuildWithZimam' }: { siteTitle?: string } = $props();

	let mobileMenuOpen = $state(false);

	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMenu() {
		mobileMenuOpen = false;
	}

	const navItems = [
		{ label: 'About', href: '/#about' },
		{ label: 'Services', href: '/#services' },
		{ label: 'Skills', href: '/#skills' },
		{ label: 'Work', href: '/work' }
	];
</script>

<header
	class="sticky top-0 z-50 border-b-[3px] border-black bg-[#FFF9EC] shadow-[0px_4px_0px_#000000]"
>
	<div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Brand Logo -->
		<a
			href="/"
			onclick={closeMenu}
			class="inline-flex items-center gap-2 rounded-[6px] border-[3px] border-black bg-[#FFD60A] px-3.5 py-1.5 text-xl font-black tracking-tight text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-[#ffe14d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
		>
			<Icon name="Terminal" size={24} />
			<span>{siteTitle}</span>
		</a>

		<!-- Desktop Navigation -->
		<nav class="hidden items-center gap-6 md:flex" aria-label="Main Navigation">
			{#each navItems as item (item.href)}
				<a
					href={item.href}
					class="rounded-[4px] border-2 border-transparent px-3 py-1.5 text-base font-bold text-black transition-all hover:border-black hover:bg-[#FF3EA5] hover:text-white hover:shadow-[2px_2px_0px_#000]"
				>
					{item.label}
				</a>
			{/each}
			<Button href="/#contact" variant="primary" size="sm" class="font-bold">Get in Touch</Button>
		</nav>

		<!-- Mobile Hamburger Toggle -->
		<button
			onclick={toggleMenu}
			type="button"
			aria-label="Toggle navigation menu"
			aria-expanded={mobileMenuOpen}
			class="cursor-pointer rounded-[6px] border-[3px] border-black bg-[#FF3EA5] p-2 text-white shadow-[3px_3px_0px_#000000] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] md:hidden"
		>
			<Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
		</button>
	</div>

	<!-- Mobile Dropdown Menu -->
	{#if mobileMenuOpen}
		<nav
			class="flex flex-col gap-4 border-t-[3px] border-black bg-[#FFF9EC] p-6 shadow-[0px_6px_0px_#000000] md:hidden"
			aria-label="Mobile Navigation"
		>
			{#each navItems as item (item.href)}
				<a
					href={item.href}
					onclick={closeMenu}
					class="rounded-[6px] border-[3px] border-black bg-white p-3.5 text-lg font-bold text-black shadow-[3px_3px_0px_#000000] transition-all hover:bg-[#FFD60A]"
				>
					{item.label}
				</a>
			{/each}
			<Button href="/#contact" onclick={closeMenu} variant="primary" size="lg" class="w-full">
				Get in Touch
			</Button>
		</nav>
	{/if}
</header>
