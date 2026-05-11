<script>
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();
	let { topics, topicSize, page, pageSize, orderBy, orderDir } = $derived(data);

	const columns = [
		{ id: 'name', header: 'Name' },
		{ id: 'description', header: 'Description' }
	];

	/**
	 * Constructs query params for a nav event.
	 * @param {{orderBy: string, orderDir: string, page: number}} params
	 * @returns {string}
	 */
	function buildQuery(params) {
		const query = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			query.set(key, value.toString());
		}
		return query.toString();
	}

	// Keep track of changes to the entries
	/** @type {Record<string, Record<string, string>>} */
	let changes = $state({});

	$effect(() => {
		topics;
		changes = {};
	});

	let queryParams = $derived({ page, orderBy, orderDir });

	/** @type {string} */
	let prevLink = $derived(`?${buildQuery({ ...queryParams, page: page - 1 })}`);

	/** @type {string} */
	let nextLink = $derived(`?${buildQuery({ ...queryParams, page: page + 1 })}`);

	/** @type {string[]} */
	let pageLinks = $derived(
		Array.from({ length: Math.ceil(topicSize / pageSize) }, (_, i) => {
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
		goto(`?${buildQuery({ orderBy: id, orderDir: order, page })}`);
	}

	/**
	 * Delete a topic.
	 * @param {number} id
	 */
	async function deleteTopic(id) {
		try {
			const response = await fetch('/builder/topics/' + id, {
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
</script>

<div class="flex justify-between">
	<h1 class="page-heading text-4xl">Topics</h1>
	<div class="flex gap-2">
		<a href="/builder/vocabulary/new" class="btn btn-primary">Add New</a>
	</div>
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
							<span aria-hidden="true">v</span>
						{:else if getSortOrder(column.id) === 'desc'}
							<span aria-hidden="true">^</span>
						{/if}
					</th>
				{/each}
				<th class="px-6 py-3 text-right">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each topics as row (row.id)}
				{@const changeKey = String(row.id)}
				<tr
					class="border-b border-[var(--cloud-soft)] bg-white {changes[changeKey]
						? 'bg-[var(--edukits-blue-light)]'
						: ''}"
				>
					{#each columns as column (column.id)}
						<td class="px-6 py-4 font-bold whitespace-nowrap text-[var(--ink)]">
							<p
								contenteditable="true"
								oninput={(e) => {
									const id = String(row.id);
									const key = column.id;
									const value = e.currentTarget.innerText;
									changes[id] = { ...changes[id], [key]: value };

									// If the change for this cell is the same as the original value, remove it
									const original = topics.find((topic) => topic.id === id);
									let isDifferent = false;
									for (const [key, value] of Object.entries(changes[id])) {
										if (original[key] !== value) {
											isDifferent = true;
											break;
										}
									}
									if (!isDifferent) {
										delete changes[id];
									}
								}}
							>
								{row[column.id]}
							</p>
						</td>
					{/each}
					<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
						{#if changes[changeKey]}
							<button
								class="text-link mr-2"
								onclick={async () => {
									try {
										const response = await fetch('/builder/topics/' + row.id, {
											method: 'PATCH',
											headers: {
												'Content-Type': 'application/json'
											},
											body: JSON.stringify(changes[changeKey])
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
								}}
							>
								Save
							</button>
						{/if}
						<button onclick={() => deleteTopic(row.id)} class="text-red-600 hover:underline"
							>Delete</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Pagination -->
{#if topicSize > pageSize}
	<div class="mx-auto flex w-min gap-1 text-sm">
		<a href={prevLink} class="btn" aria-disabled={page <= 1}>Previous</a>
		{#each Array.from({ length: Math.ceil(topicSize / pageSize) }, (_, i) => i + 1) as pageNum (pageNum)}
			<a href={pageLinks[pageNum - 1]} class="btn {pageNum === page ? 'soft-pill' : ''}"
				>{pageNum}</a
			>
		{/each}
		<!--{#if vocabSize > page * pageSize}-->
		<a href={nextLink} class="btn" aria-disabled={topicSize <= page * pageSize}>Next</a>
		<!--{/if}-->
	</div>
{/if}
