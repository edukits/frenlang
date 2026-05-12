<script>
	/**
	 * @type {{
	 *   open: boolean,
	 *   title: string,
	 *   onclose?: () => void,
	 *   children?: import('svelte').Snippet,
	 *   footer?: import('svelte').Snippet
	 * }}
	 */
	let { open = $bindable(false), title, onclose, children, footer } = $props();

	/** @type {HTMLDialogElement | undefined} */
	let dialogEl = $state();

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) {
			dialogEl.showModal();
		} else if (!open && dialogEl.open) {
			dialogEl.close();
		}
	});

	function handleClose() {
		open = false;
		onclose?.();
	}

	/** @param {MouseEvent} event */
	function handleBackdropClick(event) {
		if (event.target === dialogEl) handleClose();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="drawer"
	onclose={handleClose}
	onclick={handleBackdropClick}
>
	{#if open}
		<div class="drawer-panel" role="document">
			<header class="drawer-header">
				<h2 class="drawer-title">{title}</h2>
				<button
					type="button"
					class="icon-btn"
					aria-label="Close"
					onclick={handleClose}
				>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
						<path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</button>
			</header>
			<div class="drawer-body">
				{@render children?.()}
			</div>
			{#if footer}
				<footer class="drawer-footer">
					{@render footer()}
				</footer>
			{/if}
		</div>
	{/if}
</dialog>
