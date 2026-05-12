<script>
	/** @type {{ exercise: any, onAnswer?: (result: { correct: boolean, quality: number }) => void }} */
	let { exercise, onAnswer } = $props();

	let item = $derived(exercise.item);
	let answer = $state('');
	let submitted = $state(false);
	let accepted = $derived([item.answer, ...(item.alternates ?? [])].filter(Boolean));
	let normalizedAnswer = $derived(normalize(answer));
	let correct = $derived(accepted.some((value) => normalize(value) === normalizedAnswer));

	/** @param {string} value */
	function normalize(value) {
		return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
	}

	/** @param {SubmitEvent} event */
	function submit(event) {
		event.preventDefault();
		if (!answer.trim()) return;
		submitted = true;
	}

	function continueLesson() {
		onAnswer?.({ correct, quality: correct ? 5 : 2 });
		answer = '';
		submitted = false;
	}
</script>

<form class="mx-auto flex max-w-xl flex-col gap-5" onsubmit={submit}>
	<div class="surface-card p-6">
		<p class="eyebrow">Type the answer</p>
		<h2 class="mt-3 text-2xl font-extrabold">{item.prompt}</h2>
	</div>

	<label class="flex flex-col gap-2 font-extrabold">
		Your answer
		<input type="text" bind:value={answer} disabled={submitted} autocomplete="off" />
	</label>

	{#if submitted}
		<div class="surface-card p-5">
			<p class="font-extrabold">{correct ? 'Correct!' : `Answer: ${item.answer}`}</p>
			{#if item.explanation}
				<p class="mt-2 text-[var(--graphite)]">{item.explanation}</p>
			{/if}
			<button type="button" class="btn btn-primary mt-4 w-full" onclick={continueLesson}
				>Continue</button
			>
		</div>
	{:else}
		<button class="btn btn-primary" disabled={!answer.trim()}>Check answer</button>
	{/if}
</form>
