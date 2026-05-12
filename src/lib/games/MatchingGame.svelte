<script>
	import Matching from '$lib/components/Matching.svelte';

	/** @type {{ exercise: any, onAnswer?: (result: { correct: boolean, quality: number }) => void }} */
	let { exercise, onAnswer } = $props();

	let item = $derived(exercise.item);
	let sourceWords = $derived([{ en: item.prompt, fr: item.answer }]);
</script>

<div class="mx-auto flex max-w-xl flex-col gap-5">
	<div class="surface-card p-6 text-center">
		<p class="eyebrow">Match</p>
		<h2 class="mt-3 text-2xl font-extrabold">Match the French pair.</h2>
	</div>

	<Matching {sourceWords} />

	<button class="btn btn-primary" onclick={() => onAnswer?.({ correct: true, quality: 4 })}>
		I matched these
	</button>
</div>
