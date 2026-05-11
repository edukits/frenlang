<script>
	import NewListDialog from '$lib/components/NewListDialog.svelte';
	import TimeAgo from 'javascript-time-ago';
	import en from 'javascript-time-ago/locale/en';
	import { onMount } from 'svelte';
	import ListAlt from '~icons/material-symbols/list-alt-sharp';
	import Square from '~icons/material-symbols/square-outline';

	let { data } = $props();
	let { session, lists } = $derived(data);

	TimeAgo.addDefaultLocale(en);
	const timeAgo = new TimeAgo('en-US');

	let currentTime = $state(Date.now());
	let formattedTimes = $derived.by(() => {
		currentTime;
		return lists.map((list) => ({
			...list,
			formattedTime: timeAgo.format(new Date(list.created_at))
		}));
	});

	onMount(() => {
		const interval = setInterval(() => {
			currentTime = Date.now();
		}, 30000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Frenlang by EduKits</title>
</svelte:head>

<div class={session ? '' : 'flex min-h-0 flex-1 flex-col justify-center'}>
	<div
		class="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[0.95fr_1.05fr]"
		class:my-16={session}
		class:md:my-20={session}
	>
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
			Make your own French vocabulary lists and review them with flashcards that remember what
			you keep forgetting. Ten quiet minutes a day is enough.
		</p>
		{#if !session}
			<a href="/sign-in" class="btn btn-primary w-full max-w-xs">Start learning</a>
		{/if}
	</div>
	</div>

	{#if session}
	<div class="container mx-auto">
		<div class="flex flex-col gap-5">
			<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<p class="eyebrow">Study workspace</p>
					<h2 class="page-heading text-4xl">Your lists</h2>
				</div>
				<NewListDialog invalidateAllOnCreation={true} />
			</div>
			<div class="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each formattedTimes as list (list.id)}
					<a class="interactive-card block p-5 font-normal" href="/list/{list.id}">
						<p class="mb-3 flex items-center gap-1 font-extrabold text-[var(--silver)]">
							{#if list.vocabulary_count > 0}
								<ListAlt class="h-6 w-auto p-0" /> {list.vocabulary_count}
							{:else}
								<Square class="h-6 w-auto p-0" /> Empty List
							{/if}
						</p>
						<h3 class="text-xl font-extrabold">{list.name}</h3>
						<p class="mt-1 text-[var(--graphite)]">{list.description}</p>
						<p class="mt-4 text-sm font-bold text-[var(--silver)]">Created {list.formattedTime}</p>
					</a>
				{/each}
			</div>
		</div>
	</div>
	{/if}
</div>

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
