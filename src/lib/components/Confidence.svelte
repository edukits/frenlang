<script>
	/** @type {number|undefined} */
	let confidence = $state();

	const bgColors = ['bg-red-600', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-sky-500'];
</script>

How well did you know this?

<!-- Confidence scale from 1 to 5 -->
<div class="flex w-full items-center justify-center">
	{#each [1, 2, 3, 4, 5] as value (value)}
		<button
			aria-pressed={confidence === value}
			class={'m-1 rounded-lg px-4 py-2 text-white ' + bgColors[value - 1]}
			onclick={() => (confidence = value)}
		>
			{value}
		</button>
	{/each}
</div>
