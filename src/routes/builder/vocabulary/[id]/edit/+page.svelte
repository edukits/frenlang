<script>
	import EditVocab from '$lib/components/EditVocab.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	const item = (() => data.item)();

	let wordType = $state(item.word_type);
	let word = $state(item.word);
	let translation = $state(item.translation);
	let gender = $state(item.gender);
	let pluralForm = $state(item.plural_form);
	let topics = $state(item.topics);

	/** @type boolean */
	let loading = $state(false);

	/**
	 * Update the vocabulary item.
	 */
	async function update() {
		loading = true;
		try {
			const res = await fetch(`/builder/vocabulary/${item.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					word_type: wordType,
					word,
					translation,
					gender,
					plural_form: wordType === 'noun' ? pluralForm : undefined,
					topic_ids: topics.map((t) => t.id)
				})
			});
			if (res.ok) {
				goto('/builder/vocabulary');
			} else {
				const json = await res.json();
				console.error(json);
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.ctrlKey && e.key === 'Enter') {
			update();
		}
		if (e.key === 'Escape') {
			goto('/builder/vocabulary');
		}
	}}
/>

<div class="flex items-center justify-between">
	<h1 class="page-heading text-4xl">Edit Vocabulary</h1>
	<div class="flex gap-2">
		<a class="btn btn-secondary flex items-center gap-2" href="/builder/vocabulary">
			Cancel
			<span class="rounded border border-[var(--cloud)] p-1 font-mono text-xs text-[var(--silver)]">
				Esc
			</span>
		</a>
		<button class="btn btn-primary flex items-center gap-2" disabled={loading} onclick={update}>
			Update
			<span class="rounded border border-blue-300 p-1 font-mono text-xs text-blue-100">
				Ctrl + Enter
			</span>
		</button>
	</div>
</div>

<EditVocab bind:word bind:translation bind:wordType bind:gender bind:pluralForm bind:topics />
