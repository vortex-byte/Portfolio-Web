<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Icon from '$lib/components/public/Icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator
	} from '$lib/components/ui/dropdown-menu';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children }: { children?: Snippet } = $props();

	let mobileOpen = $state(false);

	const navItems = [
		{ label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
		{ label: 'Hero Banner', href: '/admin/hero', icon: 'Sparkles' },
		{ label: 'About Me', href: '/admin/about', icon: 'User' },
		{ label: 'What I Can Do', href: '/admin/what-i-can-do', icon: 'LayoutGrid' },
		{ label: 'Skills', href: '/admin/skills', icon: 'CodeXml' },
		{ label: 'Work', href: '/admin/work', icon: 'Briefcase' },
		{ label: 'Messages', href: '/admin/messages', icon: 'Mail' },
		{ label: 'Footer', href: '/admin/footer', icon: 'PanelBottom' },
		{ label: 'Analytics', href: '/admin/analytics', icon: 'LineChart' },
		{ label: 'Settings', href: '/admin/settings', icon: 'Settings' }
	];

	function isCurrent(href: string) {
		if (href === '/admin') return page.url.pathname === '/admin';
		return page.url.pathname.startsWith(href);
	}
</script>

<Toaster position="top-right" />

{#if page.url.pathname === '/admin/login'}
	<main class="flex min-h-screen items-center justify-center p-4">
		{@render children?.()}
	</main>
{:else}
	<div class="flex min-h-screen bg-background text-foreground">
		<!-- Desktop Sidebar -->
		<aside class="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
			<!-- Sidebar Header -->
			<div class="flex h-12 items-center border-b px-6">
				<span class="text-sm font-bold tracking-wide">Admin Panel</span>
			</div>

			<!-- Sidebar Nav -->
			<nav class="flex-1 space-y-1 overflow-y-auto p-4">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors {isCurrent(
							item.href
						)
							? 'bg-accent font-semibold text-accent-foreground'
							: 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'}"
					>
						<Icon name={item.icon} size={18} />
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>
		</aside>

		<!-- Main Content Container -->
		<div class="flex min-w-0 flex-1 flex-col">
			<!-- Topbar -->
			<header
				class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6"
			>
				<div class="flex items-center gap-3">
					<!-- Mobile Drawer Trigger -->
					<Sheet bind:open={mobileOpen}>
						<SheetTrigger>
							<Button variant="ghost" size="icon" class="text-muted-foreground lg:hidden">
								<Icon name="Menu" size={20} />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" class="w-72 p-0">
							<div class="flex h-12 items-center border-b px-6">
								<span class="text-sm font-bold">Admin Panel</span>
							</div>
							<nav class="space-y-1 p-4">
								{#each navItems as item (item.href)}
									<a
										href={item.href}
										onclick={() => (mobileOpen = false)}
										class="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors {isCurrent(
											item.href
										)
											? 'bg-accent font-semibold text-accent-foreground'
											: 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'}"
									>
										<Icon name={item.icon} size={18} />
										<span>{item.label}</span>
									</a>
								{/each}
							</nav>
						</SheetContent>
					</Sheet>

					<Separator orientation="vertical" class="hidden h-6 sm:block" />
				</div>

				<div class="flex items-center gap-3">
					<a
						href="/"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-1.5 rounded-md border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
					>
						<span>View Site</span>
						<Icon name="ExternalLink" size={14} />
					</a>

					<!-- Admin Profile & Logout Dropdown -->
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button variant="outline" size="sm" class="gap-2 font-bold">
								<Icon name="User" size={16} />
								<span>Admin</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" class="w-48">
							<DropdownMenuItem class="p-0">
								<a
									href="/admin/profile"
									class="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium"
								>
									<Icon name="User" size={16} />
									<span>Profile Settings</span>
								</a>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem class="p-0">
								<form method="POST" action="/api/admin/auth/logout" class="w-full">
									<button
										type="submit"
										class="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-sm font-medium text-destructive! hover:bg-muted"
									>
										<Icon name="LogOut" size={16} />
										<span>Logout</span>
									</button>
								</form>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			<!-- Page Body -->
			<main class="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
				{@render children?.()}
			</main>
		</div>
	</div>
{/if}
