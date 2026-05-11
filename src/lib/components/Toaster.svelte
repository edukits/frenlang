<script module>
	import { createToaster } from '@melt-ui/svelte';

	const {
		elements: { content, title, description, close },
		helpers,
		states: { toasts },
		actions: { portal }
	} = createToaster();

	export const addToast = helpers.addToast;
</script>

<script>
	import { melt } from '@melt-ui/svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import Close from '~icons/material-symbols/close';
	import Check from '~icons/material-symbols/check-circle';
	import Info from '~icons/material-symbols/info';
	import Error from '~icons/material-symbols/error';

	/**
	 * @typedef {Object} ToastData
	 * @property {string} title
	 * @property {string} description
	 * @property {'success' | 'info' | 'error'} type
	 */

	/** @param {unknown} data */
	function asToastData(data) {
		return /** @type {ToastData} */ (data);
	}
</script>

<div
	class="fixed top-0 right-0 z-50 m-4 flex flex-col items-end gap-2 md:top-auto md:bottom-0"
	use:portal
>
	{#each $toasts as { id, data } (id)}
		{@const toast = asToastData(data)}
		<div
			use:melt={$content(id)}
			animate:flip={{ duration: 500 }}
			in:fly={{ duration: 150, x: '100%' }}
			out:fly={{ duration: 150, x: '100%' }}
			class="rounded-lg bg-neutral-800 text-white shadow-md"
		>
			<div
				class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5"
			>
				<div>
					<h3 use:melt={$title(id)} class="flex items-center gap-1 font-semibold">
						{#if toast.type === 'success'}
							<Check class="text-green-500" />
						{:else if toast.type === 'info'}
							<Info class="text-sky-500" />
						{:else if toast.type === 'error'}
							<Error class="text-red-500" />
						{/if}
						{toast.title}
					</h3>
					<div use:melt={$description(id)}>
						{toast.description}
					</div>
				</div>
				<button
					use:melt={$close(id)}
					aria-label="close notification"
					class="absolute top-4 right-4 grid size-6 place-items-center rounded-full hover:bg-white/25"
				>
					<Close />
				</button>
			</div>
		</div>
	{/each}
</div>
