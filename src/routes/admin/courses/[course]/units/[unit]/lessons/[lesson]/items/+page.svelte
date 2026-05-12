<script>
	let { data } = $props();

	let itemsJson = $state(
		JSON.stringify(
			[
				{
					prompt: 'bonjour',
					answer: 'hello',
					alternates: ['good morning'],
					type: 'translate',
					choices: ['hello', 'goodbye', 'please', 'thanks'],
					explanation: 'Bonjour is the standard daytime greeting.',
					language: 'fr'
				}
			],
			null,
			2
		)
	);
	let saving = $state(false);
	let message = $state('');
	let errorMessage = $state('');

	/** @param {SubmitEvent} event */
	async function createItems(event) {
		event.preventDefault();
		let items;
		try {
			items = JSON.parse(itemsJson);
			if (!Array.isArray(items)) {
				throw new Error('Items JSON must be an array.');
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Items JSON is invalid.';
			return;
		}

		saving = true;
		message = '';
		errorMessage = '';
		try {
			const response = await fetch('/admin/api/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId: data.lesson.id, items })
			});
			if (!response.ok) throw new Error('Could not import items.');
			message = 'Items imported. Reload to refresh the list.';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not import items.';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{data.lesson.name} Items | Frenlang Admin</title>
</svelte:head>

<div class="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
	<section class="surface-card p-6">
		<a href="/admin/courses/{data.course.slug}/units/{data.unit.slug}/lessons" class="text-link">
			Back to lessons
		</a>
		<p class="eyebrow mt-5">Items</p>
		<h2 class="mt-2 text-2xl font-extrabold">{data.lesson.name}</h2>
		<p class="mt-2 text-[var(--graphite)]">{data.lesson.description}</p>

		<div class="mt-5 grid gap-3">
			{#each data.items ?? [] as item (item.id)}
				<article class="surface-card p-4">
					<div class="flex flex-col justify-between gap-2 md:flex-row md:items-start">
						<div>
							<h3 class="text-lg font-extrabold">{item.item.prompt ?? item.item.word}</h3>
							<p class="mt-1 text-[var(--graphite)]">{item.item.answer ?? item.item.translation}</p>
						</div>
						<p class="soft-pill px-3 py-1 text-sm">{item.item.type ?? item.itemTable}</p>
					</div>
					{#if item.item.explanation}
						<p class="mt-3 text-sm font-bold text-[var(--silver)]">{item.item.explanation}</p>
					{/if}
				</article>
			{:else}
				<p class="rounded-xl border border-dashed border-[var(--cloud)] p-4 text-[var(--graphite)]">
					Import drill items to make this lesson playable.
				</p>
			{/each}
		</div>
	</section>

	<form class="surface-card flex flex-col gap-4 p-6" onsubmit={createItems}>
		<p class="eyebrow">Bulk import</p>
		<label class="form-field">
			Items JSON
			<textarea bind:value={itemsJson} rows="18" class="code-box" spellcheck="false"></textarea>
		</label>
		<button class="btn btn-primary" disabled={saving}
			>{saving ? 'Importing...' : 'Import items'}</button
		>
		{#if message}<p class="font-extrabold text-[#087545]">{message}</p>{/if}
		{#if errorMessage}<p class="font-extrabold text-[var(--edukits-red-deep)]">
				{errorMessage}
			</p>{/if}
	</form>
</div>

<style>
	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-weight: 800;
	}

	.code-box {
		width: 100%;
		border: 1px solid var(--cloud);
		border-radius: 12px;
		background: var(--cloud-soft);
		padding: 1rem;
		color: var(--ink);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.8125rem;
		font-weight: 600;
	}
</style>
