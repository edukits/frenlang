<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Logo from '../../img/Logomark.png';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let email = $state('');
	let errorMessage = $state('');
	let loading = $state(false);

	async function signInWithEmail() {
		if (loading) {
			return;
		}

		loading = true;

		try {
			const { error } = await supabase.auth.signInWithOtp({
				email: email,
				options: {
					emailRedirectTo: page.url.origin + '/auth/callback'
				}
			});

			if (error) {
				throw error;
			}

			goto('/auth/otp?email=' + encodeURIComponent(email));
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto my-10 max-w-sm">
	<img src={Logo} alt="Logo" class="mx-auto mb-4 w-14" />
	<h1 class="text-center text-3xl font-semibold">Sign in to your account</h1>
	<p class="py-2 text-center text-slate-500">Get started with your email below.</p>

	<form
		class="mt-8"
		onsubmit={(event) => {
			event.preventDefault();
			signInWithEmail();
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
				type="email"
				name="email"
				required={true}
				bind:value={email}
				placeholder="you@example.com"
				class="w-full"
			/>
		</div>
		<div class="mb-4">
			<button type="submit" disabled={loading} class="btn btn-primary w-full">
				{#if loading}
					Loading...
				{:else}
					Continue with email
				{/if}
			</button>
		</div>
	</form>
</div>
