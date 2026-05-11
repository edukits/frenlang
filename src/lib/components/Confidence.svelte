<script>
	/** @type {number|undefined} */
	let confidence = $state();

	const bgColors = [
		'bg-red-600',
		'bg-orange-500',
		'bg-amber-400 text-[var(--ink)]',
		'bg-[var(--mint)]',
		'bg-[var(--edukits-blue)]'
	];
</script>

How well did you know this?

<!-- Confidence scale from 1 to 5 -->
<div class="flex w-full items-center justify-center">
	{#each [1, 2, 3, 4, 5] as value (value)}
		<button
			aria-pressed={confidence === value}
			class={'m-1 rounded-xl px-4 py-2 font-extrabold text-white ' + bgColors[value - 1]}
			onclick={() => (confidence = value)}
		>
			{value}
		</button>
	{/each}
</div>
