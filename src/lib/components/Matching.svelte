<script>
	// import ProgressNav from '$lib/ProgressNav.svelte';
	// import Summary from '$lib/Summary.svelte';

	/*
	 * Word matching game in Svelte.
	 * 5 pairs of words are shown at a time, in a mixed order.
	 * English on the left, French on the right.
	 * The matching words may not be next to each other.
	 * The user must click on the English word, then on the matching French word.
	 * When both have been selected, a new pair of words is put into those places.
	 */

	/**
	 * @typedef {Object} Word
	 * @property {string} en
	 * @property {string} fr
	 *
	 * @typedef {Object} MatchWord
	 * @property {string} value
	 * @property {string} match
	 * @property {number} status
	 * @property {boolean} fading
	 */

	/** @type {{ sourceWords?: Word[] }} */
	let { sourceWords = [] } = $props();
	/** @type {Word[]} */
	let shuffledWords = $state([]);

	const WordStatus = {
		Default: 0,
		CorrectMatch: 1,
		IncorrectMatch: 2
	};

	// Construct initial words list by taking the first 5 pairs from the shuffled list.
	/** @type {MatchWord[]} */
	let lhsWords = $state([]);
	/** @type {MatchWord[]} */
	let rhsWords = $state([]);

	// Track which words are currently selected
	/** @type {number | null} */
	let lhsSelectedId = $state(null);
	/** @type {number | null} */
	let rhsSelectedId = $state(null);

	// Track index of correct matches
	let matches = $state(0);
	let _incorrectMatches = $state(0);

	// Queue upcoming words
	/** @type {MatchWord[]} */
	let lhsQueue = $state([]);
	/** @type {MatchWord[]} */
	let rhsQueue = $state([]);

	// Track whether the game is over
	let gameOver = $state(false);

	// Track game times
	let startTime = $state(Date.now());
	/** @type {number | null} */
	let _timeToComplete = $state(null);

	/** @param {Word[]} wordsToUse */
	function resetGame(wordsToUse) {
		const remaining = [...wordsToUse].sort(() => Math.random() - 0.5);
		/** @type {Word[]} */
		const words = [];
		if (remaining.length < 5) {
			words.push(...remaining);
			remaining.length = 0;
		} else {
			while (words.length < 5) {
				const word = remaining.pop();
				if (word) words.push(word);
			}
		}

		shuffledWords = remaining;
		lhsWords = words.map((word) => ({
			value: word.en,
			match: word.fr,
			status: WordStatus.Default,
			fading: false
		}));
		rhsWords = words
			.map((word) => ({
				value: word.fr,
				match: word.en,
				status: WordStatus.Default,
				fading: false
			}))
			.sort(() => Math.random() - 0.5);
		lhsSelectedId = null;
		rhsSelectedId = null;
		matches = 0;
		_incorrectMatches = 0;
		lhsQueue = [];
		rhsQueue = [];
		gameOver = false;
		startTime = Date.now();
		_timeToComplete = null;
	}

	$effect(() => {
		resetGame(sourceWords);
	});

	// Add next word to queue
	/**
	 * @param {number} lhsId
	 * @param {number} rhsId
	 */
	function unqueue(lhsId, rhsId) {
		if (lhsQueue.length > 0) {
			const lhsWord = lhsQueue.pop();
			const rhsWord = rhsQueue.splice(Math.floor(Math.random() * rhsQueue.length), 1)[0];
			if (!lhsWord || !rhsWord) return;

			// Replace the selected words with new ones
			lhsWords[lhsId] = lhsWord;
			rhsWords[rhsId] = rhsWord;
		} else {
			if (matches === sourceWords.length) {
				// Game is over
				_timeToComplete = Date.now() - startTime;
				gameOver = true;
			}
		}
	}

	/** @param {number} id */
	function selectEnWord(id) {
		rhsSelectedId = null;
		lhsSelectedId = id;
	}

	/** @param {number} id */
	function selectFrWord(id) {
		if (lhsSelectedId === null) {
			return;
		}
		const lhsId = lhsSelectedId;
		const rhsId = id;
		rhsSelectedId = rhsId;

		// Check if the selected words match
		if (lhsWords[lhsId].match === rhsWords[rhsId].value) {
			matches++;

			let newWord = shuffledWords.pop();
			if (newWord) {
				lhsQueue.push({
					value: newWord.en,
					match: newWord.fr,
					status: WordStatus.Default,
					fading: false
				});
				rhsQueue.push({
					value: newWord.fr,
					match: newWord.en,
					status: WordStatus.Default,
					fading: false
				});
			}

			lhsWords[lhsId].status = WordStatus.CorrectMatch;
			rhsWords[rhsId].status = WordStatus.CorrectMatch;

			// After a short delay, fade out the matched words
			setTimeout(() => {
				lhsWords[lhsId].fading = true;
				rhsWords[rhsId].fading = true;
			}, 500);

			// After a longer delay, replace the matched words with new ones
			setTimeout(() => {
				unqueue(lhsId, rhsId);
			}, 2000);
		} else {
			_incorrectMatches++;

			lhsWords[lhsId].status = WordStatus.IncorrectMatch;
			rhsWords[rhsId].status = WordStatus.IncorrectMatch;

			// After a short delay, reset the selected words
			setTimeout(() => {
				lhsWords[lhsId].status = WordStatus.Default;
				rhsWords[rhsId].status = WordStatus.Default;
			}, 1000);
		}

		// Reset the selected words
		lhsSelectedId = null;
		rhsSelectedId = null;
	}

	let pairs = $derived.by(() => {
		const nextPairs = [];
		for (let i = 0; i < lhsWords.length; i++) {
			nextPairs.push({
				lhs: lhsWords[i].value,
				rhs: rhsWords[i].value
			});
		}
		return nextPairs;
	});
</script>

{#if gameOver}
	<!--    <Summary-->
	<!--            xp={sourceWords.length}-->
	<!--            time={timeToComplete}-->
	<!--            accuracy={matches / (matches + incorrectMatches)}-->
	<!--            button={{-->
	<!--                text: 'Continue',-->
	<!--                click: () => exit?.()-->
	<!--            }}-->
	<!--    />-->
{:else}
	<!--    <ProgressNav-->
	<!--            current={matches + 1}-->
	<!--            total={sourceWords.length}-->
	<!--            exit={() => exit?.()}-->
	<!--    />-->

	<div class="game">
		{#each pairs as { lhs, rhs }, index (index)}
			<div class="pair">
				<button
					class="btn word"
					class:selected={index === lhsSelectedId}
					class:correctMatch={lhsWords[index].status === WordStatus.CorrectMatch}
					class:incorrectMatch={lhsWords[index].status === WordStatus.IncorrectMatch}
					class:fading={lhsWords[index].fading}
					onclick={() => selectEnWord(index)}
				>
					{lhs}
				</button>
				<button
					class="btn word"
					class:selected={index === rhsSelectedId}
					class:correctMatch={rhsWords[index].status === WordStatus.CorrectMatch}
					class:incorrectMatch={rhsWords[index].status === WordStatus.IncorrectMatch}
					class:fading={rhsWords[index].fading}
					onclick={() => selectFrWord(index)}
				>
					{rhs}
				</button>
			</div>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.game {
		padding: 1rem 0;
	}

	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.word {
		display: block;
		width: 100%;
		padding: 0.75rem;
		border-radius: 12px;
		background-color: var(--snow);
		color: var(--graphite);
		font-size: 1rem;
		font-weight: 800;
		opacity: 1;
		transition:
			opacity 0.5s ease-in-out,
			background-color 0.15s ease-in-out,
			color 0.15s ease-in-out;
	}

	.word:hover {
		background-color: var(--edukits-blue-light);
		transition: none;
	}

	.word.selected {
		background-color: var(--edukits-blue-light);
		color: var(--edukits-blue);
		border-color: var(--edukits-blue-bright);
	}

	.word.correctMatch {
		background-color: color-mix(in srgb, var(--mint) 18%, white);
		color: #087545;
		border-color: var(--mint);
		cursor: default;
	}

	.word.incorrectMatch {
		background-color: #fff0f0;
		color: var(--edukits-red-deep);
		border-color: var(--edukits-red);
		cursor: default;
	}

	.word.fading {
		opacity: 0;
	}
</style>
