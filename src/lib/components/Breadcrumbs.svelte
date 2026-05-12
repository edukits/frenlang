<script>
	/** @type {{ items: { href?: string, label: string }[] }} */
	let { items } = $props();
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
	{#each items as crumb, i (crumb.label + i)}
		{#if i > 0}
			<span class="sep" aria-hidden="true">/</span>
		{/if}
		{#if crumb.href && i < items.length - 1}
			<a href={crumb.href}>{crumb.label}</a>
		{:else}
			<span class="current">{crumb.label}</span>
		{/if}
	{/each}
</nav>
