<script>
	let { total = 0, current = 0 } = $props();
</script>

<div class="mx-auto flex w-min justify-between gap-2">
	{#each Array.from({ length: total }, (_, i) => i) as i (i)}
		{#if i + 1 === current}
			<div class="h-3 w-3 rounded-full border-2 border-[var(--edukits-blue-bright)]"></div>
		{:else if i < current}
			<div class="h-3 w-3 rounded-full bg-[var(--edukits-blue-bright)]"></div>
		{:else}
			<div class="h-3 w-3 rounded-full bg-[var(--cloud)]"></div>
		{/if}
	{/each}
</div>
