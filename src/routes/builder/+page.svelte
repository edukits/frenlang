<script>
	let { data } = $props();
</script>

<h1 class="page-heading text-4xl">Dashboard</h1>

<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	<!-- Topics -->
	<a class="interactive-card block p-5" href="/builder/topics">
		<h2 class="text-xl font-extrabold">Topics</h2>
		<span class="mt-3 block text-4xl font-extrabold text-[var(--edukits-blue)]"
			>{data.topicSize}</span
		>
	</a>

	<!-- Vocabulary -->
	<a class="interactive-card block p-5" href="/builder/vocabulary">
		<h2 class="text-xl font-extrabold">Vocabulary</h2>
		<span class="mt-3 block text-4xl font-extrabold text-[var(--edukits-blue)]"
			>{data.vocabSize}</span
		>
	</a>
</div>
