<script>
	/** @type {{ flipped?: boolean, front?: import('svelte').Snippet, back?: import('svelte').Snippet, show?: import('svelte').Snippet, confidence?: (confidence: number) => void }} */
	let { flipped = $bindable(false), front, back, show, confidence: onConfidence } = $props();

	/** @type {HTMLButtonElement[]} */
	let confidenceButtons = $state([]);

	/**
	 * Handle keydown events.
	 * - Space: Flip the card.
	 * - 1-5: Dispatch the confidence level.
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		if (event.key === ' ') {
			flipped = !flipped;
		} else if (event.key >= '1' && event.key <= '5') {
			confidenceButtons[+event.key - 1].focus();
			// Wait a moment to show the focus outline before clicking the button
			setTimeout(() => confidenceButtons[+event.key - 1].click(), 100);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="container mx-auto text-center">
	<!-- Flashcard -->
	<div class="mx-auto w-full max-w-sm">
		<div
			class="card-container mb-4 rounded-xl border border-slate-300 bg-white px-8 py-8"
			class:content-hidden={!flipped}
		>
			<div>
				{@render front?.()}
			</div>
			{#if flipped}
				<div class="mt-5 border-t border-t-slate-300 pt-5">
					{@render back?.()}
				</div>
			{/if}
		</div>
	</div>

	{#if flipped}
		<!-- Confidence Buttons -->
		<div class="mx-auto flex w-min flex-col">
			<p class="mb-4 text-slate-700">How well did you know this?</p>
			<div class="flex justify-center space-x-4">
				{#each [1, 2, 3, 4, 5] as confidence (confidence)}
					<button
						class="btn"
						onclick={() => onConfidence?.(confidence)}
						bind:this={confidenceButtons[confidence - 1]}
					>
						{confidence}
					</button>
				{/each}
			</div>
			<div class="mt-2 flex justify-between text-sm text-slate-500">
				<span>Not at all</span>
				<span>Perfectly</span>
			</div>
		</div>
	{:else}
		<!-- Show Answer Button -->
		<button onclick={() => (flipped = true)} class="btn">
			{#if show}
				{@render show()}
			{:else}
				Show Answer
			{/if}
		</button>
	{/if}
</div>
