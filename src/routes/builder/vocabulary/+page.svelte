<script>
	import Select from '$lib/components/form/Select.svelte';
	import MaterialSymbolsSearch from '~icons/material-symbols/search';
	import MaterialSymbolsAdd from '~icons/material-symbols/add';
	import MaterialSymbolsChevronLeft from '~icons/material-symbols/chevron-left';
	import MaterialSymbolsChevronRight from '~icons/material-symbols/chevron-right';
	import { goto, invalidateAll } from '$app/navigation';
	import { wordTypes } from '$lib/french.js';
	import ArrowDown from '~icons/material-symbols/keyboard-arrow-down';
	import ArrowUp from '~icons/material-symbols/keyboard-arrow-up';

	let { data } = $props();
	let { vocabulary, vocabSize, page, pageSize, orderBy, orderDir } = $derived(data);
	let wordType = $derived(data.wordType ?? '');

	const columns = [
		{ id: 'word', header: 'Word' },
		{ id: 'translation', header: 'Translation' },
		{ id: 'word_type', header: 'Type' }
	];

	/**
	 * Constructs query params for a nav event.
	 * @param {{orderBy: string, orderDir: string, page: number, wordType: string}} params
	 * @returns {string}
	 */
	function buildQuery(params) {
		const query = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			query.set(key, value.toString());
		}
		return query.toString();
	}

	let queryParams = $derived({ page, orderBy, orderDir, wordType });

	/** @type {string | null} */
	let prevLink = $derived(page > 1 ? `?${buildQuery({ ...queryParams, page: page - 1 })}` : null);

	/** @type {string | null} */
	let nextLink = $derived(
		vocabSize > page * pageSize ? `?${buildQuery({ ...queryParams, page: page + 1 })}` : null
	);

	/** @type {string[]} */
	let pageLinks = $derived(
		Array.from({ length: Math.ceil(vocabSize / pageSize) }, (_, i) => {
			const pageNum = i + 1;
			return `?${buildQuery({ ...queryParams, page: pageNum })}`;
		})
	);

	/** @param {string} id */
	function getSortOrder(id) {
		return orderBy === id ? orderDir : null;
	}

	/** @param {string} id */
	function toggleSort(id) {
		const order = orderBy === id && orderDir === 'asc' ? 'desc' : 'asc';
		goto(`?${buildQuery({ ...queryParams, orderBy: id, orderDir: order, page })}`);
	}

	/**
	 * Delete a vocabulary item.
	 * @param {number} id
	 */
	async function deleteVocabulary(id) {
		try {
			const response = await fetch('/builder/vocabulary/' + id, {
				method: 'DELETE'
			});
			const { error } = await response.json();
			if (error) {
				console.error(error);
				return;
			}
			await invalidateAll();
		} catch (e) {
			console.error(e);
		}
	}

	/** @param {string | number} id */
	function getTopics(id) {
		const vocab = vocabulary.find((v) => v.id === id);
		if (!vocab) return [];
		return vocab.topics.map(
			(
				/** @type {{ name: string }} */
				topic
			) => topic.name
		);
	}
</script>

<!-- Header -->
<div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
	<div class="flex flex-row items-center gap-2">
		<h1 class="page-heading text-4xl">Vocabulary</h1>
		<!-- Count -->
		<span class="soft-pill px-3 py-1 text-xs">{vocabSize}</span>
	</div>
	<div class="flex flex-wrap gap-2">
		<input type="text" placeholder="Enter search term" />
		<button class="btn flex items-center gap-1"><MaterialSymbolsSearch /> Search</button>
		<a href="/builder/vocabulary/new" class="btn btn-primary flex items-center gap-1"
			><MaterialSymbolsAdd /> Add New</a
		>
	</div>
</div>

<!-- Filter by word type -->
<div class="my-4 flex max-w-sm flex-col">
	<Select
		labelTitle="Filter by Word Type"
		options={[
			{ value: '', label: 'All Types' },
			...Object.entries(wordTypes).map(([value, label]) => ({ value, label }))
		]}
		bind:value={wordType}
		onchange={() => goto(`?${buildQuery({ ...queryParams, wordType, page: 1 })}`)}
	/>
</div>

<div class="relative my-5 overflow-x-auto">
	<table class="w-full text-left text-sm text-[var(--graphite)] rtl:text-right">
		<thead class="border-b border-[var(--cloud)] text-[var(--ink)]">
			<tr>
				{#each columns as column (column.id)}
					<th
						class="cursor-pointer px-6 py-3 font-extrabold hover:bg-[var(--edukits-blue-light)]"
						onclick={() => toggleSort(column.id)}
					>
						{column.header}
						{#if getSortOrder(column.id) === 'asc'}
							<ArrowDown class="inline" />
						{:else if getSortOrder(column.id) === 'desc'}
							<ArrowUp class="inline" />
						{/if}
					</th>
				{/each}
				<th class="px-6 py-3">Topics</th>
				<th class="px-6 py-3 text-right">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each vocabulary as row (row.id)}
				<tr class="border-b border-[var(--cloud-soft)] bg-white">
					{#each columns as column (column.id)}
						<td class="px-6 py-2 font-bold whitespace-nowrap text-[var(--ink)]">
							{row[column.id]}
						</td>
					{/each}
					<td>
						{#each getTopics(row.id) as topic (topic)}
							<span class="soft-pill mr-1 px-2 py-1 text-xs">{topic}</span>
						{/each}
					</td>
					<td class="px-6 py-2 text-right text-sm font-medium whitespace-nowrap">
						<a href="/builder/vocabulary/{row.id}/edit" class="text-link mr-2">Edit</a>
						<button onclick={() => deleteVocabulary(row.id)} class="text-red-600 hover:underline"
							>Delete</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Pagination -->
{#if vocabSize > pageSize}
	<div class="mx-auto flex w-min gap-1 text-sm">
		<a href={prevLink} class="btn flex items-center" aria-disabled={page <= 1}
			><MaterialSymbolsChevronLeft /></a
		>
		{#each Array.from({ length: Math.ceil(vocabSize / pageSize) }, (_, i) => i + 1) as pageNum (pageNum)}
			<a href={pageLinks[pageNum - 1]} class="btn {pageNum === page ? 'soft-pill' : ''}"
				>{pageNum}</a
			>
		{/each}
		<!--{#if vocabSize > page * pageSize}-->
		<a href={nextLink} class="btn flex items-center" aria-disabled={vocabSize <= page * pageSize}
			><MaterialSymbolsChevronRight /></a
		>
		<!--{/if}-->
	</div>
{/if}
