<script>
	import { page } from '$app/state';
</script>

<div class="py-40 text-center">
	<h1 class="my-2 text-5xl font-semibold">
		Error {page.status}
	</h1>

	{#if page.error}
		<p class="my-2 text-xl text-slate-500">{page.error.message}</p>
	{/if}

	<a href="/" class="mt-4 text-sky-600 hover:underline">Go back home</a>
</div>
