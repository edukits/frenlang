<script>
	import FlashcardGame from './FlashcardGame.svelte';
	import FillBlank from './FillBlank.svelte';
	import MatchingGame from './MatchingGame.svelte';
	import MultipleChoice from './MultipleChoice.svelte';
	import Typing from './Typing.svelte';

	/** @type {{ session: any }} */
	let { session } = $props();

	let currentIndex = $state(0);
	/** @type {{ itemTable: string, itemId: string, correct: boolean, quality: number }[]} */
	let results = $state([]);
	let submitting = $state(false);
	/** @type {null | { xpEarned: number, coinsEarned: number, stars: number, tier: string, currentStreak: number }} */
	let summary = $state(null);
	let errorMessage = $state('');
	let startedAt = Date.now();

	let lesson = $derived(session.lesson);
	let exercises = $derived(session.exercises ?? []);
	let total = $derived(exercises.length);
	let currentExercise = $derived(exercises[currentIndex]);
	let correctCount = $derived(results.filter((result) => result.correct).length);
	let progressPercent = $derived(total ? Math.round((currentIndex / total) * 100) : 0);

	/** @param {{ correct: boolean, quality: number }} answer */
	async function recordAnswer(answer) {
		if (!currentExercise || submitting) return;

		results = [
			...results,
			{
				itemTable: currentExercise.itemTable,
				itemId: currentExercise.itemId,
				correct: answer.correct,
				quality: answer.quality
			}
		];

		if (currentIndex + 1 >= total) {
			await submitLesson();
		} else {
			currentIndex += 1;
		}
	}

	async function submitLesson() {
		submitting = true;
		errorMessage = '';
		const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

		try {
			const response = await fetch(`/learn/lesson/${lesson.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ results, minutes })
			});
			if (!response.ok) {
				throw new Error('Could not save lesson results.');
			}
			summary = await response.json();
			currentIndex = total;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not save lesson results.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
	<div class="flex flex-col gap-3">
		<a href="/learn" class="text-link w-fit">Back to skill tree</a>
		<div class="surface-card p-5">
			<div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<p class="eyebrow">Lesson</p>
					<h1 class="text-3xl font-extrabold">{lesson.name}</h1>
					<p class="mt-1 text-[var(--graphite)]">{lesson.description}</p>
				</div>
				<p class="soft-pill px-4 py-2">{lesson.xpReward} XP</p>
			</div>
			<div class="mt-5 h-3 overflow-hidden rounded-full bg-[var(--cloud-soft)]">
				<div
					class="h-full rounded-full bg-[var(--edukits-blue)]"
					style:width={`${progressPercent}%`}
				></div>
			</div>
			<p class="mt-2 text-sm font-bold text-[var(--silver)]">
				{Math.min(currentIndex + 1, total)} of {total}
			</p>
		</div>
	</div>

	{#if total === 0}
		<div class="surface-card p-6 text-center">
			<h2 class="text-2xl font-extrabold">No exercises yet.</h2>
			<p class="mt-2 text-[var(--graphite)]">Add items to this lesson from the admin area.</p>
		</div>
	{:else if summary}
		<div class="surface-card p-6 text-center">
			<p class="eyebrow">Complete</p>
			<h2 class="mt-2 text-3xl font-extrabold">Nice work.</h2>
			<p class="mt-2 text-[var(--graphite)]">
				You answered {correctCount} of {total} correctly.
			</p>
			<div class="mt-6 grid gap-3 sm:grid-cols-4">
				<div class="surface-card p-4">
					<p class="eyebrow">XP</p>
					<p class="text-2xl font-extrabold">{summary.xpEarned}</p>
				</div>
				<div class="surface-card p-4">
					<p class="eyebrow">Coins</p>
					<p class="text-2xl font-extrabold">{summary.coinsEarned}</p>
				</div>
				<div class="surface-card p-4">
					<p class="eyebrow">Stars</p>
					<p class="text-2xl font-extrabold text-[var(--sunshine)]">{summary.stars}/3</p>
				</div>
				<div class="surface-card p-4">
					<p class="eyebrow">Streak</p>
					<p class="text-2xl font-extrabold">{summary.currentStreak}</p>
				</div>
			</div>
			<a href="/learn" class="btn btn-primary mt-6">Continue path</a>
		</div>
	{:else if currentExercise}
		{#if currentExercise.gameType === 'flashcard'}
			<FlashcardGame exercise={currentExercise} onAnswer={recordAnswer} />
		{:else if currentExercise.gameType === 'multiple_choice'}
			<MultipleChoice exercise={currentExercise} onAnswer={recordAnswer} />
		{:else if currentExercise.gameType === 'fill_blank'}
			<FillBlank exercise={currentExercise} onAnswer={recordAnswer} />
		{:else if currentExercise.gameType === 'matching'}
			<MatchingGame exercise={currentExercise} onAnswer={recordAnswer} />
		{:else}
			<Typing exercise={currentExercise} onAnswer={recordAnswer} />
		{/if}
	{/if}

	{#if submitting}
		<p class="text-center font-extrabold text-[var(--graphite)]">Saving lesson...</p>
	{/if}
	{#if errorMessage}
		<div
			class="surface-card border-[var(--edukits-red)] p-4 text-center text-[var(--edukits-red-deep)]"
		>
			<p class="font-extrabold">{errorMessage}</p>
			<button class="btn btn-primary mt-3" onclick={submitLesson}>Try again</button>
		</div>
	{/if}
</div>
