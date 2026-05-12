<script>
	import Flashcard from '$lib/components/Flashcard.svelte';

	let { data } = $props();

	let reviews = $derived(data.reviews ?? []);
	let currentIndex = $state(0);
	let flipped = $state(false);
	let submitting = $state(false);
	let errorMessage = $state('');

	let currentReview = $derived(reviews[currentIndex]);
	let remaining = $derived(reviews.length - currentIndex);

	/** @param {number} quality */
	async function submitQuality(quality) {
		if (!currentReview || submitting) return;
		submitting = true;
		errorMessage = '';

		try {
			const response = await fetch('/review', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					itemTable: currentReview.itemTable,
					itemId: currentReview.itemId,
					quality
				})
			});
			if (!response.ok) {
				throw new Error('Could not save review.');
			}
			currentIndex += 1;
			flipped = false;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not save review.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Review | Frenlang</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="eyebrow">Spaced review</p>
			<h1 class="page-heading text-4xl">Due cards</h1>
			<p class="mt-2 text-[var(--graphite)]">
				Rate each card from 1 to 5 to schedule the next review.
			</p>
		</div>
		<p class="soft-pill px-4 py-2">{Math.max(remaining, 0)} due</p>
	</div>

	{#if !currentReview}
		<div class="surface-card p-8 text-center">
			<p class="eyebrow">Clear</p>
			<h2 class="mt-2 text-2xl font-extrabold">No reviews due right now.</h2>
			<p class="mx-auto mt-2 max-w-xl text-[var(--graphite)]">
				Complete lessons to add more French cards to your review queue.
			</p>
			<a href="/learn" class="btn btn-primary mt-5">Learn a lesson</a>
		</div>
	{:else}
		<Flashcard confidence={submitQuality} bind:flipped>
			{#snippet front()}
				<p>{currentReview.item.prompt}</p>
			{/snippet}
			{#snippet back()}
				<p>{currentReview.item.answer}</p>
				{#if currentReview.item.explanation}
					<p class="mt-3 text-base font-bold text-[var(--graphite)]">
						{currentReview.item.explanation}
					</p>
				{/if}
			{/snippet}
		</Flashcard>
	{/if}

	{#if submitting}
		<p class="text-center font-extrabold text-[var(--graphite)]">Saving review...</p>
	{/if}
	{#if errorMessage}
		<p
			class="surface-card border-[var(--edukits-red)] p-4 text-center font-extrabold text-[var(--edukits-red-deep)]"
		>
			{errorMessage}
		</p>
	{/if}
</div>
