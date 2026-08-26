<script lang="ts">
	import type { PageData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { data }: { data: PageData } = $props();

	let metrics = $derived(data.metrics);
	let recentMessages = $derived(data.recentMessages);
	let dailyPreview = $derived(data.dailyViewsPreview);

	let maxPreview = $derived(() => {
		if (dailyPreview.length === 0) return 10;
		return Math.max(...dailyPreview.map((d) => d.viewCount), 10);
	});
</script>

<AdminTitle title="Overview" />

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col gap-1">
		<h1 class="text-3xl font-black tracking-tight">Overview</h1>
		<p class="text-sm text-muted-foreground">
			Manage your portfolio content, view incoming contact inquiries, and monitor visitor traffic.
		</p>
	</div>

	<!-- Overview Stat Cards -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Views Today -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Views Today</CardTitle>
				<Icon name="Eye" size={20} class="text-primary" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black">{metrics.todayViews}</div>
				<p class="mt-1 text-xs text-muted-foreground">Pageviews today</p>
			</CardContent>
		</Card>

		<!-- Views This Month -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Views This Month</CardTitle>
				<Icon name="Calendar" size={20} class="text-primary" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black">{metrics.monthViews}</div>
				<p class="mt-1 text-xs text-muted-foreground">Current month total</p>
			</CardContent>
		</Card>

		<!-- Unread Messages -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Unread Inquiries</CardTitle>
				<Icon name="Mail" size={20} class="text-primary" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black">{metrics.unreadMessages}</div>
				<p class="mt-1 text-xs text-muted-foreground">Contact messages</p>
			</CardContent>
		</Card>

		<!-- Total Work Projects -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Projects Showcase</CardTitle>
				<Icon name="Briefcase" size={20} class="text-primary" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black">{metrics.totalWork}</div>
				<p class="mt-1 text-xs text-muted-foreground">Portfolio items</p>
			</CardContent>
		</Card>
	</div>

	<!-- 14-Day Traffic Trend & Quick Actions -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
		<!-- Traffic Preview Chart (14 Days) -->
		<div class="space-y-4 lg:col-span-7">
			<Card>
				<CardHeader class="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle class="flex items-center gap-2 text-base font-bold">
						<Icon name="TrendingUp" size={18} class="text-primary" />
						<span>14-Day Traffic Trend</span>
					</CardTitle>
					<a
						href="/admin/analytics"
						class="flex flex-row gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
					>
						<span>Full Report</span>
						<Icon name="MoveRight" size={16} />
					</a>
				</CardHeader>
				<CardContent class="pt-6">
					{#if dailyPreview.length > 0}
						<div class="flex h-44 items-end gap-2 border-b px-1 pb-2">
							{#each dailyPreview as item (item.date)}
								<div class="group relative flex min-w-[16px] flex-1 flex-col items-center gap-1">
									<!-- Tooltip -->
									<div
										class="pointer-events-none absolute -top-8 z-10 rounded border bg-popover px-1.5 py-0.5 font-mono text-[9px] whitespace-nowrap text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100"
									>
										{item.date.slice(5)}: {item.viewCount}
									</div>
									<div
										style="height: {Math.max((item.viewCount / maxPreview()) * 130, 6)}px"
										class="w-full rounded-t bg-primary transition-all"
									></div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="flex h-44 items-center justify-center text-sm text-muted-foreground italic">
							No recent traffic activity.
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Quick Actions -->
		<div class="space-y-4 lg:col-span-5">
			<h2 class="text-base font-bold">Quick Management</h2>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<Button href="/admin/work/new" variant="outline" class="h-14 justify-start gap-3">
					<Icon name="Plus" size={20} class="text-primary" />
					<div class="flex flex-col text-left">
						<span class="text-sm font-bold">Add New Work</span>
						<span class="text-[11px] font-normal text-muted-foreground">Create project card</span>
					</div>
				</Button>

				<Button href="/admin/hero" variant="outline" class="h-14 justify-start gap-3">
					<Icon name="Sparkles" size={20} class="text-primary" />
					<div class="flex flex-col text-left">
						<span class="text-sm font-bold">Edit Hero Banner</span>
						<span class="text-[11px] font-normal text-muted-foreground">Headline & photo</span>
					</div>
				</Button>

				<Button href="/admin/messages" variant="outline" class="h-14 justify-start gap-3">
					<Icon name="Mail" size={20} class="text-primary" />
					<div class="flex flex-col text-left">
						<span class="text-sm font-bold">View Messages</span>
						<span class="text-[11px] font-normal text-muted-foreground">Inquiries inbox</span>
					</div>
				</Button>

				<Button href="/admin/analytics" variant="outline" class="h-14 justify-start gap-3">
					<Icon name="LineChart" size={20} class="text-primary" />
					<div class="flex flex-col text-left">
						<span class="text-sm font-bold">Analytics</span>
						<span class="text-[11px] font-normal text-muted-foreground">Visitor trends</span>
					</div>
				</Button>
			</div>
		</div>
	</div>

	<!-- Recent Inquiries Preview -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold">Recent Inquiries</h2>
			<a
				href="/admin/messages"
				class="flex flex-row gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
			>
				<span>View All</span>
				<Icon name="MoveRight" size={16} />
			</a>
		</div>

		<Card class="overflow-hidden p-0">
			{#if recentMessages && recentMessages.length > 0}
				<div class="divide-y">
					{#each recentMessages as msg (msg.id)}
						<div
							class="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/40"
						>
							<div class="flex min-w-0 flex-col gap-1">
								<div class="flex items-center gap-2">
									<span class="truncate text-sm font-bold">{msg.name}</span>
									<span class="truncate text-xs text-muted-foreground">&lt;{msg.email}&gt;</span>
								</div>
								<p class="line-clamp-1 text-xs text-muted-foreground">{msg.message}</p>
							</div>
							<div class="flex shrink-0 flex-col items-end gap-1">
								<Badge variant={msg.isRead ? 'secondary' : 'default'}>
									{msg.isRead ? 'Read' : 'New'}
								</Badge>
								<span class="font-mono text-[10px] text-muted-foreground">
									{new Date(msg.createdAt).toLocaleDateString()}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="p-8 text-center text-sm text-muted-foreground">
					No contact messages received yet.
				</div>
			{/if}
		</Card>
	</div>
</div>
