<script>
	import SearchableCombobox from '$lib/components/form/SearchableCombobox.svelte';

	/**
	 * @typedef {Object} Topic
	 * @property {string|number} id
	 * @property {string} name
	 * @property {string} description
	 */

	/** @type {{ topics?: Topic[] }} */
	let { topics = $bindable([]) } = $props();

	/**
	 * Fetch topics from the server.
	 * @param {string} searchTerm
	 * @returns {Promise<Topic[]>}
	 */
	async function fetchTopics(searchTerm) {
		const queryParams = new URLSearchParams({
			search: searchTerm.toLowerCase(),
			limit: String(10),
			exclude: JSON.stringify([...topics.map((topic) => topic.id)])
		});
		try {
			const response = await fetch('/builder/topics/search?' + queryParams);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(error);
			return [];
		}
	}
</script>

<SearchableCombobox
	bind:selectedItems={topics}
	fetchItems={fetchTopics}
	label="Add topic"
	placeholder="Type to search for topics"
/>

{#if topics.length > 0}
	<div class="my-5 flex flex-col gap-1">
		<span class="mb-1 block text-sm text-slate-500">Selected topics</span>
		<div class="flex flex-wrap gap-2">
			{#each topics as topic (topic.id)}
				<button
					class="rounded-md bg-sky-100 px-2 py-1 text-sky-900 hover:bg-red-100 hover:text-red-900"
					onclick={() => {
						topics = topics.filter((t) => t.id !== topic.id);
					}}
				>
					{topic.name}
				</button>
			{/each}
		</div>
	</div>
{/if}
