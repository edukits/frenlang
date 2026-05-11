<script>
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import ArrowDropDown from '~icons/material-symbols/arrow-drop-down';
	import ArrowDropUp from '~icons/material-symbols/arrow-drop-up';
	import MaterialSymbolsCheck from '~icons/material-symbols/check';

	/** @type {{ labelTitle?: string, placeholder?: string, options?: Array<{ value: string, label: string }>, value?: string, onchange?: (value: string | undefined) => void }} */
	let {
		labelTitle,
		placeholder = 'Select an option',
		options = [],
		value = $bindable(),
		onchange
	} = $props();

	/**
	 * Given a value, return the corresponding option object.
	 * If no option is found, return undefined.
	 * @param {string} value
	 * @returns {{ value: string, label: string } | undefined}
	 */
	function getOption(value) {
		return options.find((o) => o.value === value);
	}

	const {
		elements: { trigger, menu, option, label },
		states: { selected, selectedLabel, open },
		helpers: { isSelected }
	} = createSelect({
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
	});

	// Sync state at the beginning.
	selected.set(getOption(value || ''));

	// Sync state when value changes.
	$effect(() => {
		const currentSelectedValue = /** @type {string | undefined} */ ($selected?.value);
		if (currentSelectedValue !== value) {
			selected.set(getOption(value || ''));
		}
	});

	// Sync value when state changes.
	$effect(() => {
		const currentSelectedValue = /** @type {string | undefined} */ ($selected?.value);
		if (currentSelectedValue !== value) {
			value = currentSelectedValue;
			onchange?.(value);
		}
	});
</script>

<div class="flex flex-col">
	<!-- svelte-ignore a11y_label_has_associated_control - $label contains the 'for' attribute -->
	{#if labelTitle}
		<label class="mb-1 block text-sm text-slate-500" use:melt={$label}>{labelTitle}</label>
	{/if}
	<button
		class="flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left focus:border-sky-500 focus:ring-3 focus:ring-sky-500/20 focus:outline-hidden {$selectedLabel
			? 'text-black'
			: 'text-slate-500'}"
		use:melt={$trigger}
		aria-label="Food"
	>
		{$selectedLabel || placeholder}
		{#if $open}
			<!-- Add your ChevronUp icon here -->
			<ArrowDropUp />
		{:else}
			<!-- Add your ChevronDown icon here -->
			<ArrowDropDown />
		{/if}
	</button>
	{#if $open}
		<div
			class="z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-md shadow-slate-100"
			use:melt={$menu}
			transition:fade={{ duration: 150 }}
		>
			{#each options as { label, value } (value)}
				<div
					class="relative cursor-pointer scroll-my-2 rounded-md px-4 py-2 pl-8 hover:bg-sky-100 data-[disabled]:opacity-50 data-[highlighted]:bg-sky-200 data-[highlighted]:text-sky-900"
					use:melt={$option({ value, label })}
				>
					<div class="check {$isSelected(value) ? 'block' : 'hidden'}">
						<MaterialSymbolsCheck />
					</div>

					{label}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.check {
		position: absolute;
		left: calc(var(--spacing) * 2);
		top: 50%;
		z-index: 20;
		translate: 0 calc(-50% + 1px);
		color: var(--color-sky-500);
	}
</style>
