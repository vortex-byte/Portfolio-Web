<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Icon from '$lib/components/public/Icon.svelte';
	import AdminTitle from '$lib/components/admin/AdminTitle.svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let dailyViews = $derived(data.dailyViews);
	let monthlyViews = $derived(data.monthlyViews);
	let metrics = $derived(data.overviewMetrics);

	let dateQuery = $state('');
	let dateResult = $derived(form?.dateCount ?? data.singleDateCount);

	let monthQuery = $state('');
	let monthResult = $derived(form?.monthCount ?? data.singleMonthCount);

	$effect(() => {
		dateQuery = data.selectedDate ?? '';
		monthQuery = data.selectedMonth ?? '';
	});

	let maxDaily = $derived(() => {
		if (dailyViews.length === 0) return 10;
		return Math.max(...dailyViews.map((d) => d.viewCount), 10);
	});

	let maxMonthly = $derived(() => {
		if (monthlyViews.length === 0) return 10;
		return Math.max(...monthlyViews.map((m) => m.viewCount), 10);
	});
</script>

<AdminTitle title="Visitor Analytics" />

<div class="max-w-6xl space-y-8">
	<!-- Page Header -->
	<div>
		<h1 class="text-3xl font-black tracking-tight">Visitor Analytics</h1>
		<p class="text-sm text-muted-foreground">
			Track site traffic, daily/monthly visitor volume, unique visitors (hashed IP/cookie), and date
			range lookups.
		</p>
	</div>

	<!-- Overview Metrics Row -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Views Today
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black text-primary">{metrics.todayViews}</div>
				<p class="mt-1 text-xs text-muted-foreground">Pageviews today</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Views This Month
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black text-primary">{metrics.monthViews}</div>
				<p class="mt-1 text-xs text-muted-foreground">Current calendar month</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Total Pageviews
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black text-primary">{metrics.totalViews}</div>
				<p class="mt-1 text-xs text-muted-foreground">All-time tracked pageviews</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
					Est. Unique Visitors
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-black text-primary">{metrics.uniqueVisitors}</div>
				<p class="mt-1 text-xs text-muted-foreground">Via Hashed IP / Cookie</p>
			</CardContent>
		</Card>
	</div>

	<!-- Daily Views Bar Chart -->
	<Card>
		<CardHeader class="flex flex-row items-center justify-between border-b pb-4">
			<div class="flex items-center gap-2">
				<Icon name="BarChart2" size={20} class="text-primary" />
				<CardTitle class="text-base font-bold">Daily Views (Last 30 Days)</CardTitle>
			</div>
		</CardHeader>
		<CardContent class="pt-6">
			{#if dailyViews.length > 0}
				<div class="flex h-64 items-end gap-2 overflow-x-auto border-b px-2 pb-2">
					{#each dailyViews as item (item.date)}
						<div class="group relative flex min-w-[24px] flex-1 flex-col items-center gap-2">
							<!-- Tooltip -->
							<div
								class="pointer-events-none absolute -top-9 z-10 rounded border bg-popover px-2 py-1 font-mono text-[10px] whitespace-nowrap text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100"
							>
								{item.date}: {item.viewCount} views
							</div>

							<!-- Bar -->
							<div
								style="height: {Math.max((item.viewCount / maxDaily()) * 180, 8)}px"
								class="w-full rounded-t bg-primary transition-all hover:opacity-80"
							></div>

							<!-- Date Label -->
							<span class="origin-left rotate-45 font-mono text-[9px] text-muted-foreground">
								{item.date.slice(5)}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="flex h-64 items-center justify-center text-sm text-muted-foreground italic">
					No daily view data recorded yet.
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Monthly Views Bar Chart -->
	<Card>
		<CardHeader class="flex flex-row items-center justify-between border-b pb-4">
			<div class="flex items-center gap-2">
				<Icon name="Calendar" size={20} class="text-primary" />
				<CardTitle class="text-base font-bold">Monthly Views (Last 12 Months)</CardTitle>
			</div>
		</CardHeader>
		<CardContent class="pt-6">
			{#if monthlyViews.length > 0}
				<div class="flex h-64 items-end gap-4 overflow-x-auto border-b px-2 pb-2">
					{#each monthlyViews as item (item.yearMonth)}
						<div class="group relative flex min-w-[40px] flex-1 flex-col items-center gap-2">
							<!-- Tooltip -->
							<div
								class="pointer-events-none absolute -top-9 z-10 rounded border bg-popover px-2 py-1 font-mono text-[10px] whitespace-nowrap text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100"
							>
								{item.yearMonth}: {item.viewCount} views
							</div>

							<!-- Bar -->
							<div
								style="height: {Math.max((item.viewCount / maxMonthly()) * 180, 12)}px"
								class="w-full rounded-t bg-primary transition-all hover:opacity-80"
							></div>

							<!-- Label -->
							<span class="font-mono text-xs font-semibold text-muted-foreground">
								{item.yearMonth}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="flex h-64 items-center justify-center text-sm text-muted-foreground italic">
					No monthly view data recorded yet.
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Specific Date & Month Lookups -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Date Lookup -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-base font-bold">
					<Icon name="Search" size={18} class="text-primary" />
					<span>Lookup Specific Day</span>
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<form method="POST" action="?/lookupDate" class="flex gap-2">
					<div class="flex-1">
						<Label for="date-input" class="sr-only">Date</Label>
						<Input id="date-input" type="date" name="date" bind:value={dateQuery} />
					</div>
					<Button type="submit">Search</Button>
				</form>

				{#if dateResult !== null && dateResult !== undefined}
					<div class="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
						<span class="text-sm font-medium text-muted-foreground">Views on {dateQuery}:</span>
						<span class="font-mono text-xl font-black text-primary">{dateResult}</span>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Month Lookup -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-base font-bold">
					<Icon name="CalendarRange" size={18} class="text-primary" />
					<span>Lookup Specific Month</span>
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<form method="POST" action="?/lookupMonth" class="flex gap-2">
					<div class="flex-1">
						<Label for="month-input" class="sr-only">Month</Label>
						<Input id="month-input" type="month" name="month" bind:value={monthQuery} />
					</div>
					<Button type="submit">Search</Button>
				</form>

				{#if monthResult !== null && monthResult !== undefined}
					<div class="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
						<span class="text-sm font-medium text-muted-foreground">Views in {monthQuery}:</span>
						<span class="font-mono text-xl font-black text-primary">{monthResult}</span>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
