<script>
	import { createRadioGroup, melt, createSync } from '@melt-ui/svelte';

	/** @type {{ options: Array<{ value: string, label: string }>, value?: string }} */
	let { options, value = $bindable('') } = $props();

	const {
		states,
		elements: { root, item },
		helpers: { isChecked }
	} = createRadioGroup({
		defaultValue: 'default'
	});

	const sync = createSync(states);
	$effect(() => {
		sync.value(value, (v) => (value = v));
	});
</script>

<div use:melt={$root} class="flex flex-col gap-3 data-[orientation=horizontal]:flex-row">
	{#each options as { value, label } (value)}
		<div class="flex items-center gap-3">
			<button
				use:melt={$item(value)}
				class="grid h-6 w-6 cursor-default place-items-center rounded-full border border-[var(--cloud)] transition-colors hover:border-[var(--edukits-blue-bright)] focus:border-[var(--edukits-blue-bright)]"
				id={value}
				aria-labelledby="{value}-label"
			>
				{#if $isChecked(value)}
					<div class="h-3 w-3 rounded-full bg-[var(--edukits-blue)]"></div>
				{/if}
			</button>
			<label class="leading-none font-bold" for={value} id="{value}-label">
				{label}
			</label>
		</div>
	{/each}
</div>
