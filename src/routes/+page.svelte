<script>
	let { data } = $props();

	let { session, dashboard, skillTree, nextLesson } = $derived(data);
	let profile = $derived(dashboard?.profile);
	let today = $derived(dashboard?.today ?? { xpEarned: 0, lessonsCompleted: 0, minutes: 0 });
	let goalMinutes = $derived(profile?.dailyGoalMinutes ?? 10);
	let goalProgress = $derived(
		Math.min(100, Math.round((today.minutes / Math.max(goalMinutes, 1)) * 100))
	);
	let hasCourseContent = $derived((skillTree?.units ?? []).some((unit) => unit.lessons?.length));
</script>

<svelte:head>
	<title>Frenlang by EduKits</title>
</svelte:head>

{#if !session}
	<div class="flex min-h-0 flex-1 flex-col justify-center">
		<div class="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[0.95fr_1.05fr]">
			<div class="hero-visual">
				<img
					src="/images/abstract-flashcards-hero.png"
					alt=""
					width="1448"
					height="1086"
					class="hero-image"
					decoding="async"
					fetchpriority="high"
				/>
			</div>
			<div class="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
				<p class="eyebrow">French, made to stick</p>
				<h1 class="brand-heading text-5xl md:text-6xl">Frenlang</h1>
				<p class="max-w-xl text-lg leading-7 text-[var(--graphite)]">
					Practice curated French drills with pre-made lessons, quick games, streaks, XP, and
					rewards that make daily review feel light.
				</p>
				<a href="/sign-in" class="btn btn-primary w-full max-w-xs">Start learning</a>
			</div>
		</div>
	</div>
{:else}
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
			<div>
				<p class="eyebrow">Learner dashboard</p>
				<h1 class="page-heading text-4xl">
					Welcome back{profile?.displayName ? `, ${profile.displayName}` : ''}
				</h1>
				<p class="mt-2 text-[var(--graphite)]">
					Keep your French streak moving with one focused lesson.
				</p>
			</div>
			<a href="/learn" class="btn btn-primary">Open skill tree</a>
		</div>

		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
			<div class="surface-card p-5">
				<p class="eyebrow">Streak</p>
				<p class="mt-2 text-3xl font-extrabold">{profile?.currentStreak ?? 0} days</p>
			</div>
			<div class="surface-card p-5">
				<p class="eyebrow">Daily goal</p>
				<p class="mt-2 text-3xl font-extrabold">{today.minutes}/{goalMinutes} min</p>
				<div class="mt-3 h-3 overflow-hidden rounded-full bg-[var(--cloud-soft)]">
					<div
						class="h-full rounded-full bg-[var(--edukits-blue)]"
						style:width={`${goalProgress}%`}
					></div>
				</div>
			</div>
			<div class="surface-card p-5">
				<p class="eyebrow">Today XP</p>
				<p class="mt-2 text-3xl font-extrabold">{today.xpEarned}</p>
			</div>
			<div class="surface-card p-5">
				<p class="eyebrow">Tier</p>
				<p class="mt-2 text-3xl font-extrabold">{profile?.tier ?? 'Bronze'}</p>
			</div>
			<div class="surface-card p-5">
				<p class="eyebrow">Coins</p>
				<p class="mt-2 text-3xl font-extrabold text-[var(--sunshine)]">{profile?.coins ?? 0}</p>
			</div>
		</div>

		{#if nextLesson}
			<a
				href="/learn/lesson/{nextLesson.id}"
				class="interactive-card grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center"
			>
				<div>
					<p class="eyebrow">Continue learning</p>
					<h2 class="mt-2 text-2xl font-extrabold">{nextLesson.name}</h2>
					<p class="mt-1 text-[var(--graphite)]">
						{nextLesson.unitName} · {nextLesson.xpReward} XP
					</p>
				</div>
				<span class="btn btn-primary pointer-events-none">Start lesson</span>
			</a>
		{:else if hasCourseContent}
			<div class="surface-card p-6">
				<p class="eyebrow">All caught up</p>
				<h2 class="mt-2 text-2xl font-extrabold">You have completed the available path.</h2>
				<p class="mt-1 text-[var(--graphite)]">
					Review due cards or add new content from the admin area.
				</p>
			</div>
		{:else}
			<div class="surface-card grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<p class="eyebrow">No course content yet</p>
					<h2 class="mt-2 text-2xl font-extrabold">Create the first French course path.</h2>
					<p class="mt-1 text-[var(--graphite)]">
						Add courses, units, lessons, and drill items from the admin tools.
					</p>
				</div>
				<a href="/admin" class="btn btn-primary">Add content</a>
			</div>
		{/if}
	</div>
{/if}

<style>
	.hero-visual {
		display: flex;
		justify-content: center;
		min-height: 220px;
	}

	.hero-image {
		width: 100%;
		max-width: min(440px, 88vw);
		height: auto;
		display: block;
	}
</style>
