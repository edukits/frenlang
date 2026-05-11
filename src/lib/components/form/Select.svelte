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
		<label class="mb-1 block text-sm font-extrabold text-[var(--silver)]" use:melt={$label}
			>{labelTitle}</label
		>
	{/if}
	<button
		class="flex min-h-11 items-center justify-between rounded-xl border border-[var(--cloud)] px-3 py-2 text-left font-bold focus:border-[var(--edukits-blue-bright)] focus:ring-3 focus:ring-[var(--edukits-blue-bright)]/20 focus:outline-hidden {$selectedLabel
			? 'text-[var(--ink)]'
			: 'text-[var(--silver)]'}"
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
			class="z-10 flex max-h-[300px] flex-col overflow-y-auto rounded-xl border border-[var(--cloud)] bg-white p-1"
			use:melt={$menu}
			transition:fade={{ duration: 150 }}
		>
			{#each options as { label, value } (value)}
				<div
					class="relative cursor-pointer scroll-my-2 rounded-xl px-4 py-2 pl-8 font-bold hover:bg-[var(--edukits-blue-light)] data-[disabled]:opacity-50 data-[highlighted]:bg-[var(--edukits-blue-light)] data-[highlighted]:text-[var(--edukits-blue)]"
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
		color: var(--edukits-blue-bright);
	}
</style>
