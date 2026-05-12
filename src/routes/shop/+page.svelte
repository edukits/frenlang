<script>
	let { data } = $props();

	let profile = $derived(data.profile);
	let rewards = $derived(data.rewards ?? []);
	let spentCoins = $state(0);
	let availableCoins = $derived(profile.coins - spentCoins);
	let purchasingId = $state('');
	let message = $state('');
	let errorMessage = $state('');

	/** @param {any} reward */
	async function purchase(reward) {
		purchasingId = reward.id;
		message = '';
		errorMessage = '';

		try {
			const response = await fetch('/shop', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ rewardId: reward.id })
			});
			if (!response.ok) {
				throw new Error('Could not purchase reward.');
			}
			spentCoins += reward.cost;
			message = `${reward.name} purchased.`;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not purchase reward.';
		} finally {
			purchasingId = '';
		}
	}
</script>

<svelte:head>
	<title>Shop | Frenlang</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="eyebrow">Reward shop</p>
			<h1 class="page-heading text-4xl">Spend your coins</h1>
			<p class="mt-2 text-[var(--graphite)]">
				Buy streak protection, XP boosts, and small profile rewards.
			</p>
		</div>
		<p class="soft-pill px-4 py-2">{availableCoins} coins</p>
	</div>

	{#if message}
		<p class="surface-card border-[var(--mint)] p-4 font-extrabold text-[#087545]">{message}</p>
	{/if}
	{#if errorMessage}
		<p
			class="surface-card border-[var(--edukits-red)] p-4 font-extrabold text-[var(--edukits-red-deep)]"
		>
			{errorMessage}
		</p>
	{/if}

	{#if rewards.length === 0}
		<div class="surface-card p-8 text-center">
			<h2 class="text-2xl font-extrabold">No rewards yet.</h2>
			<p class="mt-2 text-[var(--graphite)]">Seed rewards in Convex to populate the shop.</p>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-3">
			{#each rewards as reward (reward.id)}
				<article class="surface-card flex flex-col p-5">
					<p class="eyebrow">{reward.kind.replace('_', ' ')}</p>
					<h2 class="mt-2 text-xl font-extrabold">{reward.name}</h2>
					<p class="mt-2 flex-1 text-[var(--graphite)]">{reward.description}</p>
					<div class="mt-5 flex items-center justify-between gap-3">
						<p class="font-extrabold text-[var(--sunshine)]">{reward.cost} coins</p>
						<button
							class="btn btn-primary"
							disabled={availableCoins < reward.cost || purchasingId === reward.id}
							onclick={() => purchase(reward)}
						>
							{purchasingId === reward.id ? 'Buying...' : 'Buy'}
						</button>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
