<script>
	import { goto, invalidateAll } from '$app/navigation';
	import Logo from '../../img/Logomark.png';

	let email = $state('');
	let password = $state('');
	let mode = $state('signIn');
	let errorMessage = $state('');
	let loading = $state(false);

	let title = $derived(mode === 'signIn' ? 'Sign in to your account' : 'Create your account');
	let buttonLabel = $derived(mode === 'signIn' ? 'Sign in' : 'Create account');
	let toggleLabel = $derived(mode === 'signIn' ? 'Create an account' : 'Sign in instead');

	async function submit() {
		if (loading) {
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const response = await fetch('/auth/password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					flow: mode
				})
			});
			const result = await response.json();
			if (!response.ok || result.error) {
				throw new Error(result.error ?? 'Unable to authenticate');
			}

			await invalidateAll();
			goto('/');
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto my-10 max-w-sm">
	<img src={Logo} alt="Logo" class="mx-auto mb-4 w-14" />
	<h1 class="text-center text-3xl font-semibold">{title}</h1>
	<p class="py-2 text-center text-slate-500">Use email and password to continue.</p>

	<form
		class="mt-8"
		onsubmit={(event) => {
			event.preventDefault();
			submit();
		}}
	>
		{#if errorMessage}
			<div
				class="relative my-4 rounded border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700"
				role="alert"
			>
				<strong class="font-semibold">Error:</strong>
				<span class="block sm:inline">{errorMessage}</span>
			</div>
		{/if}
		<div class="mb-4">
			<label for="email" class="mb-1 block text-sm text-slate-500">Email</label>
			<input
				id="email"
				type="email"
				name="email"
				required={true}
				bind:value={email}
				placeholder="you@example.com"
				class="w-full"
			/>
		</div>
		<div class="mb-4">
			<label for="password" class="mb-1 block text-sm text-slate-500">Password</label>
			<input
				id="password"
				type="password"
				name="password"
				required={true}
				minlength="8"
				bind:value={password}
				class="w-full"
			/>
		</div>
		<div class="mb-4 flex flex-col gap-3">
			<button type="submit" disabled={loading} class="btn btn-primary w-full">
				{#if loading}
					Loading...
				{:else}
					{buttonLabel}
				{/if}
			</button>
			<button
				type="button"
				class="text-sm text-sky-600 hover:underline"
				onclick={() => {
					mode = mode === 'signIn' ? 'signUp' : 'signIn';
					errorMessage = '';
				}}
			>
				{toggleLabel}
			</button>
		</div>
	</form>
</div>
