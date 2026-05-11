<script>
	import ProgressDots from '$lib/components/ProgressDots.svelte';
	import Flashcard from '$lib/components/Flashcard.svelte';

	let { data } = $props();
	let {
		list: { vocabulary }
	} = $derived(data);

	/** @type {{ front: string, back: string }[]} */
	let flashcards = $derived(
		vocabulary.map(({ word, translation }) => ({
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

<div class="flex h-full min-h-[calc(100vh-10rem)] flex-col">
	<div class="mt-4 mb-10">
		<ProgressDots total={flashcards.length} current={currentCard + 1} />
	</div>

	<!-- Take up the full height of the parent container -->
	<div class="flex grow items-center justify-center">
		<Flashcard confidence={recordConfidence} bind:flipped>
			{#snippet front()}
				<p>{flashcards[currentCard].front}</p>
			{/snippet}
			{#snippet back()}
				<p class="font-bold">{flashcards[currentCard].back}</p>
			{/snippet}
		</Flashcard>
	</div>
</div>
