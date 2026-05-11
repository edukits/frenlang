<script>
	let errorDescription = '';

	if (typeof location !== 'undefined') {
		errorDescription = location.hash.split('error_description=')[1].replaceAll('+', ' ') + '.';
	}
</script>

<div class="container mx-auto my-10 max-w-md text-center">
	<h1 class="text-xl font-semibold text-gray-900">
		There was an error authenticating your account.
	</h1>

	<p class="mt-2 text-sm text-gray-500">
		{#if errorDescription}
			{errorDescription}
		{:else}
			Please try again.
		{/if}
	</p>
</div>
