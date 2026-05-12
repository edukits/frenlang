<script>
	import Flashcard from '$lib/components/Flashcard.svelte';

	/** @type {{ exercise: any, onAnswer?: (result: { correct: boolean, quality: number }) => void }} */
	let { exercise, onAnswer } = $props();

	let flipped = $state(false);
	let item = $derived(exercise.item);

	/** @param {number} quality */
	function recordConfidence(quality) {
		onAnswer?.({ correct: quality >= 3, quality });
		flipped = false;
	}
</script>

<div class="space-y-5">
	<div class="text-center">
		<p class="eyebrow">Flashcard</p>
		<h2 class="mt-2 text-2xl font-extrabold">Try to recall the answer.</h2>
	</div>

	<Flashcard confidence={recordConfidence} bind:flipped>
		{#snippet front()}
			<p>{item.prompt}</p>
		{/snippet}
		{#snippet back()}
			<p>{item.answer}</p>
			{#if item.explanation}
				<p class="mt-3 text-base font-bold text-[var(--graphite)]">{item.explanation}</p>
			{/if}
		{/snippet}
	</Flashcard>
</div>
