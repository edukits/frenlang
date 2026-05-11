<script>
	import { page } from '$app/state';
</script>

<div class="py-40 text-center">
	<h1 class="page-heading my-2 text-5xl">
		Error {page.status}
	</h1>

	{#if page.error}
		<p class="my-2 text-xl text-[var(--graphite)]">{page.error.message}</p>
	{/if}

	<a href="/" class="text-link mt-4">Go back home</a>
</div>
