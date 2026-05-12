<script>
	/** @type {{ exercise: any, onAnswer?: (result: { correct: boolean, quality: number }) => void }} */
	let { exercise, onAnswer } = $props();

	let item = $derived(exercise.item);
	let answered = $state(false);
	let selected = $state('');
	let isCorrect = $derived(selected === item.answer);
	let choices = $derived.by(() => {
		const options = [...(item.choices ?? []), item.answer].filter(Boolean);
		return Array.from(new Set(options));
	});

	/** @param {string} choice */
	function choose(choice) {
		if (answered) return;
		selected = choice;
		answered = true;
	}

	function continueLesson() {
		onAnswer?.({ correct: isCorrect, quality: isCorrect ? 5 : 2 });
		selected = '';
		answered = false;
	}
</script>

<div class="mx-auto flex max-w-xl flex-col gap-5">
	<div class="surface-card p-6 text-center">
		<p class="eyebrow">Multiple choice</p>
		<h2 class="mt-3 text-2xl font-extrabold">{item.prompt}</h2>
	</div>

	<div class="grid gap-3">
		{#each choices as choice (choice)}
			<button
				class={[
					'btn justify-start text-left',
					answered && choice === item.answer && 'answer-correct',
					answered && choice === selected && choice !== item.answer && 'answer-wrong'
				]}
				disabled={answered}
				onclick={() => choose(choice)}
			>
				{choice}
			</button>
		{/each}
	</div>

	{#if answered}
		<div class="surface-card p-5">
			<p class="font-extrabold">
				{isCorrect ? 'Correct!' : `Not quite. The answer is ${item.answer}.`}
			</p>
			{#if item.explanation}
				<p class="mt-2 text-[var(--graphite)]">{item.explanation}</p>
			{/if}
			<button class="btn btn-primary mt-4 w-full" onclick={continueLesson}>Continue</button>
		</div>
	{/if}
</div>

<style>
	.answer-correct {
		border-color: var(--mint);
		background: color-mix(in srgb, var(--mint) 18%, white);
		color: #087545;
	}

	.answer-wrong {
		border-color: var(--edukits-red);
		background: #fff0f0;
		color: var(--edukits-red-deep);
	}
</style>
