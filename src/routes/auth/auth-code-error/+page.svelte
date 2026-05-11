<script>
	let errorDescription = '';

	if (typeof location !== 'undefined') {
		errorDescription = location.hash.split('error_description=')[1].replaceAll('+', ' ') + '.';
	}
</script>

<div class="container mx-auto my-10 max-w-md text-center">
	<h1 class="page-heading text-3xl">There was an error authenticating your account.</h1>

	<p class="mt-2 text-sm font-bold text-[var(--graphite)]">
		{#if errorDescription}
			{errorDescription}
		{:else}
			Please try again.
		{/if}
	</p>
</div>
