<script>
	let { data } = $props();
</script>

<h1 class="text-3xl font-semibold">Dashboard</h1>

<div class="mt-4 grid grid-cols-3 gap-3">
	<!-- Topics -->
	<a class="btn block p-5" href="/builder/topics">
		<h2 class="text-xl font-semibold">Topics</h2>
		<span class="text-2xl text-gray-500">{data.topicSize}</span>
	</a>

	<!-- Vocabulary -->
	<a class="btn block p-5" href="/builder/vocabulary">
		<h2 class="text-xl font-semibold">Vocabulary</h2>
		<span class="text-2xl text-gray-500">{data.vocabSize}</span>
	</a>
</div>
