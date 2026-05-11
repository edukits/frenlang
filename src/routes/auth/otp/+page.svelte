<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { createPinInput, melt } from '@melt-ui/svelte';
	import { onMount } from 'svelte';

	const otpLength = 6;
	let loading = $state(false);
	let errorMessage = $state('');

	async function verify() {
		if (loading) {
			return;
		}

		const email = page.data.email;
		loading = true;

		try {
			// Make API request to this page, but with POST method
			const response = await fetch(location.href, {
				method: 'POST',
				body: JSON.stringify({ email, otp, bonjour: 'hello' }),
				headers: {
					'content-type': 'application/json'
				}
			});
			const result = await response.json();
			const { data, error } = result;
			console.log(result);
			if (error) {
				throw new Error('Unable to verify the One-Time Passcode.');
			}
			errorMessage = '';
			if (data.session) {
				goto('/', {
					invalidateAll: true
				});
			}
		} catch (error) {
			if (error instanceof Error) {
				errorMessage = error.message;
			}
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (!page.data.email) {
			goto('/');
		}
	});

	const {
		elements: { root, input },
		states: { value }
	} = createPinInput();

	let otp = $derived($value.join(''));

	$effect(() => {
		if (otp.length === otpLength) {
			verify();
		}
	});
</script>

<div class="container mx-auto my-10 max-w-sm">
	<h1 class="text-center text-3xl font-semibold">Enter your one-time passcode</h1>
	<p class="py-2 text-center text-slate-500">{page.data.email || ''}</p>

	{#if errorMessage}
		<div
			class="relative my-4 rounded border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700"
			role="alert"
		>
			<strong class="font-semibold">Error:</strong>
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	<form
		class="mt-8"
		onsubmit={(event) => {
			event.preventDefault();
			verify();
		}}
	>
		<div class="mb-4">
			<label for="otp" class="mb-1 block text-sm text-slate-500">One-Time Passcode</label>
			<!-- One-Time Passcode -->
			<div use:melt={$root} class="flex items-center justify-center gap-3">
				{#each Array.from({ length: otpLength }, (_, i) => i) as index (index)}
					<input class="w-1/6 text-center" use:melt={$input()} />
				{/each}
			</div>
		</div>
		<div class="mb-4">
			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-md border border-sky-600 bg-sky-500 p-2 font-semibold text-white hover:bg-sky-600 focus:ring-sky-300 focus:outline-hidden active:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if loading}
					Loading...
				{:else}
					Sign In
				{/if}
			</button>
		</div>
	</form>
</div>
