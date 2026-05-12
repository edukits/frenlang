<script>
	let { data } = $props();

	let profile = $derived(data.profile);
	let today = $derived(data.dashboard?.today ?? { xpEarned: 0, lessonsCompleted: 0, minutes: 0 });
	let activeRewards = $derived(data.dashboard?.activeRewards ?? 0);
	let goalMinutes = $derived(profile?.dailyGoalMinutes ?? 10);
	let goalProgress = $derived(
		Math.min(100, Math.round((today.minutes / Math.max(goalMinutes, 1)) * 100))
	);
</script>

<svelte:head>
	<title>Profile | Frenlang</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
	<div>
		<p class="eyebrow">Learner profile</p>
		<h1 class="page-heading text-4xl">{profile.displayName}</h1>
		<p class="mt-2 text-[var(--graphite)]">
			Your French progress, streaks, coins, and daily activity.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<div class="surface-card p-5">
			<p class="eyebrow">Total XP</p>
			<p class="mt-2 text-3xl font-extrabold">{profile.xp}</p>
		</div>
		<div class="surface-card p-5">
			<p class="eyebrow">Tier</p>
			<p class="mt-2 text-3xl font-extrabold">{profile.tier}</p>
		</div>
		<div class="surface-card p-5">
			<p class="eyebrow">Coins</p>
			<p class="mt-2 text-3xl font-extrabold text-[var(--sunshine)]">{profile.coins}</p>
		</div>
		<div class="surface-card p-5">
			<p class="eyebrow">Active rewards</p>
			<p class="mt-2 text-3xl font-extrabold">{activeRewards}</p>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="surface-card p-6">
			<p class="eyebrow">Streaks</p>
			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<div>
					<p class="text-sm font-extrabold text-[var(--silver)]">Current streak</p>
					<p class="text-3xl font-extrabold">{profile.currentStreak} days</p>
				</div>
				<div>
					<p class="text-sm font-extrabold text-[var(--silver)]">Longest streak</p>
					<p class="text-3xl font-extrabold">{profile.longestStreak} days</p>
				</div>
			</div>
		</div>

		<div class="surface-card p-6">
			<p class="eyebrow">Today</p>
			<div class="mt-4 grid gap-4 sm:grid-cols-3">
				<div>
					<p class="text-sm font-extrabold text-[var(--silver)]">Minutes</p>
					<p class="text-2xl font-extrabold">{today.minutes}</p>
				</div>
				<div>
					<p class="text-sm font-extrabold text-[var(--silver)]">XP</p>
					<p class="text-2xl font-extrabold">{today.xpEarned}</p>
				</div>
				<div>
					<p class="text-sm font-extrabold text-[var(--silver)]">Lessons</p>
					<p class="text-2xl font-extrabold">{today.lessonsCompleted}</p>
				</div>
			</div>
			<div class="mt-5 h-3 overflow-hidden rounded-full bg-[var(--cloud-soft)]">
				<div
					class="h-full rounded-full bg-[var(--edukits-blue)]"
					style:width={`${goalProgress}%`}
				></div>
			</div>
			<p class="mt-2 text-sm font-bold text-[var(--silver)]">
				{today.minutes}/{goalMinutes} daily minutes
			</p>
		</div>
	</div>
</div>
