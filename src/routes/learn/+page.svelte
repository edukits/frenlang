<script>
	import ProgressDots from '$lib/components/ProgressDots.svelte';
	import Flashcard from '$lib/components/Flashcard.svelte';

	let { data } = $props();

	/** @type {{ front: string, back: string }[]} */
	let flashcards = $derived(
		data.vocabulary.map(({ word, translation }) => ({
			front: word,
			back: translation
		}))
	);

	/** @type {number[]} */
	let confidence = $state([]);

	let currentCard = $state(0);
	let flipped = $state(false);

	$effect(() => {
		confidence = Array(flashcards.length).fill(0);
	});

	/** @param {number} value */
	function recordConfidence(value) {
		confidence[currentCard] = value;
		currentCard = (currentCard + 1) % flashcards.length;
		flipped = false;
	}
</script>

<div class="mt-4 mb-10">
	<ProgressDots total={flashcards.length} current={currentCard + 1} />
</div>

<Flashcard confidence={recordConfidence} bind:flipped>
	{#snippet front()}
		<p>{flashcards[currentCard].front}</p>
	{/snippet}
	{#snippet back()}
		<p class="font-bold">{flashcards[currentCard].back}</p>
	{/snippet}
</Flashcard>

<!--{JSON.stringify(confidence)}-->
