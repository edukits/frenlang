<script>
	import EditVocab from '$lib/components/EditVocab.svelte';
	import { goto } from '$app/navigation';
	import { removeArticleFr } from '$lib/french.js';
	import { removeArticleEn } from '$lib/english.js';
	import { addToast } from '$lib/components/Toaster.svelte';

	/** @type boolean */
	let loading = $state(false);

	/** @type string */
	let word = $state('');

	/** @type string */
	let translation = $state('');

	/** @type string */
	let wordType = $state('noun');

	/** @type {'m'|'f'|''} */
	let gender = $state('');

	/** @type string */
	let pluralForm = $state('');

	/** @type {any[]} */
	let topics = $state([]);

	/** @type {any} */
	let editor = $state();

	async function add() {
		if (loading) {
			return;
		}
		loading = true;
		try {
			const cleanWord = removeArticleFr(word).trim();
			const cleanTranslation = removeArticleEn(translation).trim();
			const body = JSON.stringify({
				word_type: wordType,
				word: cleanWord,
				translation: cleanTranslation,
				plural_form: wordType === 'noun' ? removeArticleFr(pluralForm).trim() : undefined,
				gender: wordType === 'noun' ? gender : undefined,
				topic_ids: topics.map((t) => t.id)
			});
			console.log(body);
			const response = await fetch('/builder/vocabulary', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: body
			});
			const { error } = await response.json();
			if (error) {
				throw new Error(error);
			}
			editor?.reset();
			addToast({
				data: {
					title: 'Success',
					description: `Added "${cleanWord}" to vocabulary.`,
					type: 'success'
				}
			});
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			console.log(message);
			addToast({
				data: {
					title: 'Error',
					description: message,
					type: 'error'
				}
			});
		} finally {
			loading = false;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.ctrlKey && e.key === 'Enter') {
			add();
			console.log('Ctrl + Enter');
		}
		if (e.key === 'Escape') {
			goto('/builder/vocabulary');
		}
	}}
/>

<div class="flex items-center justify-between">
	<h1 class="page-heading text-4xl">Add Vocabulary</h1>
	<div class="flex gap-2">
		<a class="btn btn-secondary flex items-center gap-2" href="/builder/vocabulary">
			Cancel
			<span class="rounded border border-[var(--cloud)] p-1 font-mono text-xs text-[var(--silver)]">
				Esc
			</span>
		</a>
		<button class="btn btn-primary flex items-center gap-2" disabled={loading} onclick={add}>
			{loading ? 'Adding' : 'Add'}
			<span class="rounded border border-blue-300 p-1 font-mono text-xs text-blue-100">
				Ctrl + Enter
			</span>
		</button>
	</div>
</div>

<EditVocab
	bind:this={editor}
	bind:word
	bind:translation
	bind:wordType
	bind:gender
	bind:pluralForm
	bind:topics
/>
