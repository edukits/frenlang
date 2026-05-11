<script>
	import Select from '$lib/components/form/Select.svelte';
	import RadioGroup from '$lib/components/form/RadioGroup.svelte';
	import TopicTags from '$lib/components/form/TopicTags.svelte';
	import { wordTypes, masculineArticles, feminineArticles } from '$lib/french.js';
	import { onMount } from 'svelte';

	/** @type {{ word?: string, translation?: string, wordType?: string, gender?: 'm' | 'f' | '', pluralForm?: string, topics?: any[] }} */
	let {
		word = $bindable(''),
		translation = $bindable(''),
		wordType = $bindable(''),
		gender = $bindable(''),
		pluralForm = $bindable(''),
		topics = $bindable([])
	} = $props();

	/** @type {HTMLInputElement} */
	let wordInput;

	/**
	 * Infer gender from the word based on the article/preposition.
	 * For French.
	 * @returns {void}
	 */
	function inferGender() {
		const words = word.split(' ');
		const firstWord = words[0].toLowerCase();

		if (masculineArticles.includes(firstWord)) {
			gender = 'm';
		} else if (feminineArticles.includes(firstWord)) {
			gender = 'f';
		}
	}

	/**
	 * Reset the form fields after adding a new vocab item.
	 * @returns {void}
	 */
	export function reset() {
		word = '';
		translation = '';
		pluralForm = '';
		gender = '';
		wordInput.focus();
	}

	onMount(() => {
		wordInput.focus();
	});
</script>

<div class="my-4 flex max-w-sm flex-col">
	<Select
		labelTitle="Word Type"
		options={Object.entries(wordTypes).map(([value, label]) => ({ value, label }))}
		bind:value={wordType}
	/>
</div>

<hr class="border-b border-b-[var(--cloud-soft)]" />

<div class="my-4">
	<form>
		<div class="mb-4 grid gap-4 md:grid-cols-2">
			<div>
				<label for="word" class="mb-1 block text-sm font-extrabold text-[var(--silver)]">Word</label
				>
				<input
					type="text"
					class="w-full"
					bind:this={wordInput}
					bind:value={word}
					oninput={inferGender}
				/>
			</div>
			<div>
				<label for="meaning" class="mb-1 block text-sm font-extrabold text-[var(--silver)]"
					>Translation</label
				>
				<input type="text" class="w-full" bind:value={translation} />
			</div>
		</div>
		{#if wordType === 'noun'}
			<!-- Plural Form -->
			<div class="mb-4 grid gap-4 md:grid-cols-2">
				<div>
					<label for="plural-form" class="mb-1 block text-sm font-extrabold text-[var(--silver)]"
						>Plural Form</label
					>
					<input type="text" class="w-full" bind:value={pluralForm} />
				</div>
			</div>
			<!-- Gender -->
			<div class="flex flex-col gap-1">
				<div class="mb-1 block text-sm font-extrabold text-[var(--silver)]">Gender</div>
				<RadioGroup
					options={[
						{ value: 'm', label: 'Masculine' },
						{ value: 'f', label: 'Feminine' }
					]}
					bind:value={gender}
				/>
			</div>
		{/if}
	</form>
</div>

<hr class="border-b border-b-[var(--cloud-soft)]" />

<TopicTags bind:topics />
