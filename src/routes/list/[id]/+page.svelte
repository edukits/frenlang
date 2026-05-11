<script>
	import SearchableVocabulary from '$lib/components/form/SearchableVocabulary.svelte';
	import ListAltSharp from '~icons/material-symbols/list-alt-sharp';
	import DeleteOutlineSharp from '~icons/material-symbols/delete-outline';
	import DeleteHistory from '~icons/material-symbols/delete-history';
	import Save from '~icons/material-symbols/save';
	import PlayingCards from '~icons/material-symbols/playing-cards';
	import Quiz from '~icons/material-symbols/quiz';
	import AllMatch from '~icons/material-symbols/all-match';
	import ProgressActivity from '~icons/material-symbols/progress-activity';
	import { invalidateAll, goto } from '$app/navigation';
	import { addToast } from '$lib/components/Toaster.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();
	let list = $derived(data.list);
	let { name, description } = $derived(list);

	/** @type {string} */
	let editedName = $state('');

	/** @type {string} */
	let editedDescription = $state('');

	/** @type {boolean} */
	let isNameEdited = $derived(editedName !== name);

	/** @type {boolean} */
	let isDescriptionEdited = $derived(editedDescription !== description);

	/**
	 * @typedef {Object} Word
	 * @property {string} id Vocabulary ID
	 * @property {string} name Word.
	 * @property {string} description Translation.
	 */

	/** @type {Word[]} */
	let wordsToAdd = $state([]);

	/** @type {string[]} */
	let wordIdsToRemove = $state([]);

	/** @type {boolean} */
	let isSaving = $state(false);

	/** @type {boolean} */
	let isDeleting = $state(false);

	/** @type {boolean} */
	let isLoading = $derived(isSaving || isDeleting);
	let sortedVocabulary = $derived(
		[...list.vocabulary].sort((a, b) => a.word.localeCompare(b.word, 'fr'))
	);

	/**
	 * Reset editing state.
	 */
	function reset() {
		editedName = name;
		editedDescription = description;
		wordsToAdd = [];
		wordIdsToRemove = [];
	}

	/**
	 * Update the list.
	 */
	async function updateList() {
		if (isLoading) {
			return;
		}
		isSaving = true;
		try {
			// Update list name and description
			if (isNameEdited || isDescriptionEdited) {
				const updateResponse = await fetch(`/list/${list.id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						name: editedName,
						description: editedDescription
					})
				});
				const { error: updateError } = await updateResponse.json();
				if (updateError) {
					throw new Error(updateError);
				}
			}

			// Add new words to the list
			if (wordsToAdd.length > 0) {
				const insertResponse = await fetch(`/list/${list.id}/vocabulary`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ vocabulary_ids: wordsToAdd.map((w) => w.id) })
				});
				const { error: insertError } = await insertResponse.json();
				if (insertError) {
					throw new Error(insertError);
				}
			}

			// Remove words from the list
			if (wordIdsToRemove.length > 0) {
				const deleteResponse = await fetch(`/list/${list.id}/vocabulary`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ vocabulary_ids: wordIdsToRemove })
				});
				const { error: deleteError } = await deleteResponse.json();
				if (deleteError) {
					throw new Error(deleteError);
				}
			}

			await invalidateAll();
			reset();

			addToast({
				data: {
					title: 'Success',
					description: 'The list has been updated.',
					type: 'success'
				}
			});
		} catch (e) {
			console.error(e);
			addToast({
				data: {
					title: 'Error',
					description: 'An error occurred while updating the list.',
					type: 'error'
				}
			});
		} finally {
			isSaving = false;
		}
	}

	/**
	 * Delete the list.
	 */
	async function deleteList() {
		if (isLoading) {
			return;
		}
		isDeleting = true;
		try {
			const response = await fetch(`/list/${list.id}`, {
				method: 'DELETE'
			});
			const { error } = await response.json();
			if (error) {
				throw new Error(error);
			}
			addToast({
				data: {
					title: 'Success',
					description: 'The list has been deleted.',
					type: 'success'
				}
			});
			await goto('/');
		} catch (e) {
			console.error(e);
			addToast({
				data: {
					title: 'Error',
					description: 'An error occurred while deleting the list.',
					type: 'error'
				}
			});
		} finally {
			isDeleting = false;
		}
	}

	onMount(() => {
		reset();
	});
</script>

<!-- List header -->
<div
	class="my-0 flex flex-col justify-between gap-6 border-b border-[var(--cloud-soft)] py-10 lg:flex-row lg:items-center"
>
	<!-- Basic info -->
	<div class="flex flex-col gap-2">
		<p class="eyebrow flex gap-1"><ListAltSharp class="h-6 w-auto p-0" /> Study List</p>
		<h1
			class="page-heading text-4xl {isNameEdited ? 'text-[var(--edukits-blue-bright)]' : ''}"
			contenteditable="true"
			bind:textContent={editedName}
		>
			{name}
		</h1>
		<p
			class="text-[var(--graphite)] {isDescriptionEdited
				? 'text-[var(--edukits-blue-bright)]'
				: ''}"
			contenteditable="true"
			bind:textContent={editedDescription}
		>
			{description}
		</p>
		<!-- Study options -->
		<div class="mt-2 flex gap-2">
			<a class="btn flex items-center gap-1 text-sm" href="/list/{list.id}/flashcards"
				><PlayingCards /> Flashcards</a
			>
			<a class="btn flex items-center gap-1 text-sm" href="/list/{list.id}/quiz"><Quiz /> Quiz</a>
			<a class="btn flex items-center gap-1 text-sm" href="/list/{list.id}/match"
				><AllMatch /> Match</a
			>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex flex-wrap gap-2">
		{#if wordsToAdd.length + wordIdsToRemove.length > 0 || isNameEdited || isDescriptionEdited}
			<button class="btn flex items-center gap-1" disabled={isLoading} onclick={reset}>
				<DeleteHistory /> Undo Edits
			</button>
			<button
				class="btn btn-primary flex items-center gap-1"
				disabled={isLoading}
				onclick={updateList}
			>
				{#if isSaving}
					<span class="animate-spin"><ProgressActivity /></span>
				{:else}
					<Save />
				{/if}
				Save
			</button>
		{:else}
			<button
				class="btn btn-danger flex items-center gap-1"
				disabled={isLoading}
				onclick={deleteList}
			>
				{#if isDeleting}
					<span class="animate-spin"><ProgressActivity /></span>
				{:else}
					<DeleteOutlineSharp />
				{/if}
				Delete
			</button>
		{/if}
	</div>
</div>

<!-- Vocabulary list -->
<h2 class="my-5 text-xl font-extrabold">Vocabulary</h2>
{#if list.vocabulary.length > 0 || wordsToAdd.length > 0}
	<div class={list.vocabulary.length > 10 ? 'md:columns-2 lg:columns-3 2xl:columns-4' : ''}>
		{#each sortedVocabulary as item (item.id)}
			<button
				class="flex cursor-pointer gap-2 hover:text-red-600 {wordIdsToRemove.includes(item.id)
					? 'to-remove'
					: ''}"
				onclick={() =>
					(wordIdsToRemove = wordIdsToRemove.includes(item.id)
						? wordIdsToRemove.filter((id) => id !== item.id)
						: [...wordIdsToRemove, item.id])}
			>
				<span class="font-semibold">{item.word}</span>
				<span class="text-[var(--graphite)]">{item.translation}</span>
			</button>
		{/each}
	</div>
	{#if wordsToAdd.length > 0}
		<div class="mt-5 flex items-center gap-2 border-b border-[var(--cloud-soft)]">
			<h3 class="font-extrabold">New vocabulary</h3>
			<p class="text-xs font-bold text-[var(--silver)]">
				Click on a word to remove it from the list.
			</p>
		</div>
	{/if}
	{#each wordsToAdd as item (item.id)}
		<button
			class="flex cursor-pointer gap-2 text-[var(--edukits-blue-bright)] hover:text-red-600"
			onclick={() => (wordsToAdd = wordsToAdd.filter((w) => w.id !== item.id))}
			onkeydown={(e) => {
				if (e.key === 'Enter') wordsToAdd = wordsToAdd.filter((w) => w.id !== item.id);
			}}
		>
			<span class="font-semibold">{item.name}</span>
			<span>{item.description}</span>
		</button>
	{/each}
{:else}
	<p class="text-[var(--graphite)]">There are no vocabulary items in this list.</p>
{/if}

<div class="mt-6 max-w-xl">
	<SearchableVocabulary
		bind:selectedWords={wordsToAdd}
		excludeIds={list.vocabulary.map((w) => w.id)}
	/>
</div>

<style>
	.to-remove {
		position: relative;
	}
	.to-remove::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		height: 2px;
		background-color: red;
		transform: translateY(-50%);
	}
</style>
