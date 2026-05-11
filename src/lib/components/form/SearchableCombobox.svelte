<script>
	import ArrowDropDown from '~icons/material-symbols/arrow-drop-down';
	import ArrowDropUp from '~icons/material-symbols/arrow-drop-up';
	import { createCombobox, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	/**
	 * @typedef {Object} Item
	 * @property {string|number} id - Unique identifier for the item
	 * @property {string} name - Display name of the item
	 * @property {string} description - Description of the item
	 * @property {boolean} [disabled] - Whether the item is disabled
	 */

	/** @type {{ selectedItems?: Item[], fetchItems: (searchTerm: string) => Promise<Item[]>, label?: string, placeholder?: string, debounceTime?: number }} */
	let {
		selectedItems = $bindable([]),
		fetchItems,
		label = 'Select items',
		placeholder = 'Type to search',
		debounceTime = 300
	} = $props();

	/** @type {Item[]} */
	let availableItems = $state([]);

	/** @type {boolean} */
	let searching = $state(false);

	/** @type {ReturnType<typeof setTimeout>|null} */
	let timer = null;

	/** @type {string} */
	let lastQuery = $state('');

	/** @param {Item} item */
	const toOption = (item) => ({
		value: item,
		label: item.name,
		disabled: item.disabled
	});

	const {
		elements: { menu, input, option, label: comboboxLabel },
		states: { open, inputValue, touchedInput, selected }
	} = createCombobox({
		forceVisible: true
	});

	$effect(() => {
		if (!$open) {
			$inputValue = $selected?.label ?? '';
		}
	});

	/** @type {Item[]} */
	let filteredItems = $derived.by(() => {
		let userFilteredItems = availableItems;
		if ($touchedInput) {
			userFilteredItems = availableItems.filter(({ name, description }) => {
				const normalizedInput = $inputValue.toLowerCase();
				return (
					name.toLowerCase().includes(normalizedInput) ||
					description.toLowerCase().includes(normalizedInput)
				);
			});
		}
		return userFilteredItems.filter((item) => {
			return !selectedItems.some((selectedItem) => selectedItem.id === item.id);
		});
	});

	$effect(() => {
		handleInput($inputValue);
	});

	/**
	 * @param {string} value
	 */
	const handleInput = (value) => {
		searching = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(async () => {
			await fetchItemsFromServer(value);
			searching = false;
		}, debounceTime);
	};

	$effect(() => {
		if ($selected) {
			selectedItems = [...selectedItems, $selected.value];
			$selected = undefined;

			if (lastQuery === '') {
				searching = true;
				fetchItemsFromServer('').then(() => {
					searching = false;
				});
			}
		}
	});

	/**
	 * Fetch items from the server.
	 * @param {string} searchTerm
	 */
	async function fetchItemsFromServer(searchTerm) {
		try {
			lastQuery = searchTerm;
			availableItems = await fetchItems(searchTerm);
		} catch (error) {
			console.error(error);
		}
	}

	onMount(() => {
		fetchItemsFromServer('');
	});
</script>

<div class="my-5 flex flex-col gap-1">
	<!-- svelte-ignore a11y_label_has_associated_control - $comboboxLabel contains the 'for' attribute -->
	<label use:melt={$comboboxLabel}>
		<span class="mb-1 block text-sm font-extrabold text-[var(--silver)]">{label}</span>
	</label>

	<div class="relative">
		<input
			type="text"
			use:melt={$input}
			class="flex h-11 w-full items-center justify-between bg-white pr-12 text-[var(--ink)]"
			{placeholder}
		/>
		<div class="absolute top-1/2 right-2 z-10 -translate-y-1/2 text-[var(--edukits-blue)]">
			{#if $open}
				<!-- Add your ChevronUp icon here -->
				<ArrowDropUp />
			{:else}
				<!-- Add your ChevronDown icon here -->
				<ArrowDropDown />
			{/if}
		</div>
	</div>
</div>

{#if $open}
	<ul
		class="z-10 flex max-h-[300px] flex-col overflow-hidden rounded-xl border border-[var(--cloud)]"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -5 }}
	>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="flex max-h-full flex-col gap-0 overflow-y-auto bg-white px-2 py-2 text-[var(--ink)]"
			tabindex="0"
		>
			{#each filteredItems as item (item.id)}
				<li
					use:melt={$option(toOption(item))}
					class="relative cursor-pointer scroll-my-2 rounded-xl px-4 py-2 hover:bg-[var(--edukits-blue-light)] data-[disabled]:opacity-50 data-[highlighted]:bg-[var(--edukits-blue-light)] data-[highlighted]:text-[var(--edukits-blue)]"
				>
					<div>
						<span class="font-extrabold">{item.name}</span>
						{#if item.description}
							<span class="block text-sm opacity-75">{item.description}</span>
						{/if}
					</div>
				</li>
			{:else}
				<li class="relative cursor-pointer rounded-xl py-1 pr-4 pl-8">
					{#if searching}
						Searching...
					{:else}
						No results found
					{/if}
				</li>
			{/each}
		</div>
	</ul>
{/if}
