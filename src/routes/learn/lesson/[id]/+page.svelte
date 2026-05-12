<script>
	import LessonRunner from '$lib/games/LessonRunner.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.session.lesson.name} | Frenlang</title>
</svelte:head>

<LessonRunner session={data.session} />
