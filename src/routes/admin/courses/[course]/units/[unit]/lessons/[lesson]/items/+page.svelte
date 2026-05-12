<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let items = $derived(data.items ?? []);

	let drawerOpen = $state(false);
	let mode = $state(/** @type {'single' | 'bulk'} */ ('single'));
	let typeFilter = $state(/** @type {'all' | 'translate' | 'multiple_choice' | 'fill_blank' | 'transform'} */ ('all'));
	let query = $state('');

	let filtered = $derived(
		items.filter((entry) => {
			const it = entry.item ?? {};
			const type = it.type ?? entry.itemTable;
			if (typeFilter !== 'all' && type !== typeFilter) return false;
			if (!query) return true;
			const q = query.toLowerCase();
			const hay = `${it.prompt ?? it.word ?? ''} ${it.answer ?? it.translation ?? ''} ${(it.alternates ?? []).join(' ')}`.toLowerCase();
			return hay.includes(q);
		})
	);

	let typeCounts = $derived(
		items.reduce(
			(acc, entry) => {
				const t = entry.item?.type ?? entry.itemTable ?? 'other';
				acc[t] = (acc[t] ?? 0) + 1;
				return acc;
			},
			/** @type {Record<string, number>} */ ({})
		)
	);

	let saving = $state(false);
	let message = $state('');
	let errorMessage = $state('');

	// Single item form state
	let single = $state({
		prompt: '',
		answer: '',
		type: 'translate',
		alternatesText: '',
		choicesText: '',
		explanation: '',
		language: 'fr'
	});

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

	function resetMessages() {
		message = '';
		errorMessage = '';
	}

	/** @param {SubmitEvent} event */
	async function submitSingle(event) {
		event.preventDefault();
		resetMessages();
		const item = {
			prompt: single.prompt.trim(),
			answer: single.answer.trim(),
			type: single.type,
			alternates: single.alternatesText
				.split(/[,;\n]/)
				.map((s) => s.trim())
				.filter(Boolean),
			choices:
				single.type === 'multiple_choice'
					? single.choicesText
							.split(/[,;\n]/)
							.map((s) => s.trim())
							.filter(Boolean)
					: undefined,
			explanation: single.explanation.trim() || undefined,
			language: single.language.trim() || 'fr'
		};

		if (!item.prompt || !item.answer) {
			errorMessage = 'Prompt and answer are required.';
			return;
		}

		saving = true;
		try {
			const response = await fetch('/admin/api/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId: data.lesson.id, items: [item] })
			});
			if (!response.ok) throw new Error('Could not save item.');
			message = `Added drill “${item.prompt}”.`;
			single = {
				prompt: '',
				answer: '',
				type: single.type,
				alternatesText: '',
				choicesText: '',
				explanation: '',
				language: single.language
			};
			drawerOpen = false;
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not save item.';
		} finally {
			saving = false;
		}
	}

	/** @param {SubmitEvent} event */
	async function submitBulk(event) {
		event.preventDefault();
		resetMessages();
		let parsed;
		try {
			parsed = JSON.parse(itemsJson);
			if (!Array.isArray(parsed)) throw new Error('JSON must be an array.');
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Invalid JSON.';
			return;
		}

		saving = true;
		try {
			const response = await fetch('/admin/api/items', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId: data.lesson.id, items: parsed })
			});
			if (!response.ok) throw new Error('Could not import items.');
			message = `Imported ${parsed.length} drill${parsed.length === 1 ? '' : 's'}.`;
			drawerOpen = false;
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not import items.';
		} finally {
			saving = false;
		}
	}

	/** @param {string} type */
	function typeBadgeClass(type) {
		switch (type) {
			case 'translate':
				return 'badge-info';
			case 'multiple_choice':
				return 'badge-violet';
			case 'fill_blank':
				return 'badge-warn';
			case 'transform':
				return 'badge-success';
			case 'vocabulary':
				return 'badge-info';
			default:
				return '';
		}
	}

	/** @param {string} type */
	function typeLabel(type) {
		return type.replace('_', ' ');
	}
</script>

<svelte:head>
	<title>{data.lesson.name} Items | Frenlang Admin</title>
</svelte:head>

<Breadcrumbs
	items={[
		{ href: '/admin', label: 'Admin' },
		{ href: '/admin/courses', label: 'Courses' },
		{ href: `/admin/courses/${data.course.slug}/units`, label: data.course.name },
		{ href: `/admin/courses/${data.course.slug}/units/${data.unit.slug}/lessons`, label: data.unit.name },
		{ label: data.lesson.name }
	]}
/>

<header class="page-header">
	<div>
		<p class="eyebrow">{data.unit.name} · {data.lesson.name} · Drills</p>
		<h1 class="page-heading text-4xl">{data.lesson.name}</h1>
		<p class="mt-2 max-w-2xl text-[var(--graphite)]">{data.lesson.description}</p>
		<div class="mt-3 flex flex-wrap gap-2 text-xs">
			<span class="badge {typeBadgeClass(data.lesson.kind)}">{data.lesson.kind}</span>
			<span class="badge badge-outline">{data.lesson.xpReward} XP</span>
			<span class="badge">order {data.lesson.order}</span>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<span class="badge badge-outline">{items.length} items</span>
		<button class="btn btn-primary" onclick={() => { mode = 'single'; drawerOpen = true; }}>+ Add drill</button>
		<button class="btn" onclick={() => { mode = 'bulk'; drawerOpen = true; }}>Bulk JSON</button>
	</div>
</header>

{#if message}
	<div class="banner banner-success">{message}</div>
{/if}

<section class="surface-card p-3">
	<div class="flex flex-col gap-3 px-2 py-2 md:flex-row md:items-center md:justify-between">
		<div class="flex flex-wrap items-center gap-2">
			<div class="tabs" role="tablist" aria-label="Filter by type">
				<button
					role="tab"
					class="tab {typeFilter === 'all' ? 'tab--active' : ''}"
					onclick={() => (typeFilter = 'all')}
				>
					All <span class="ml-1 text-[var(--silver)]">{items.length}</span>
				</button>
				{#each ['translate', 'multiple_choice', 'fill_blank', 'transform'] as t (t)}
					{#if typeCounts[t]}
						<button
							role="tab"
							class="tab {typeFilter === t ? 'tab--active' : ''}"
							onclick={() => (typeFilter = /** @type {any} */ (t))}
						>
							{typeLabel(t)} <span class="ml-1 text-[var(--silver)]">{typeCounts[t]}</span>
						</button>
					{/if}
				{/each}
			</div>
		</div>
		<input
			type="text"
			placeholder="Search prompt or answer…"
			bind:value={query}
			class="md:max-w-xs md:w-72"
			aria-label="Search drills"
		/>
	</div>

	<div class="mt-2 grid gap-2 md:grid-cols-2">
		{#each filtered as entry, i (entry.id)}
			{@const it = entry.item ?? {}}
			{@const t = it.type ?? entry.itemTable}
			{@const prompt = it.prompt ?? it.word}
			{@const answer = it.answer ?? it.translation}
			<article class="surface-card p-4">
				<div class="flex items-start justify-between gap-2">
					<div class="flex items-center gap-2 text-xs">
						<span class="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--cloud-soft)] font-extrabold text-[var(--graphite)]">{i + 1}</span>
						<span class="badge {typeBadgeClass(t)}">{typeLabel(t)}</span>
					</div>
					{#if it.language}
						<span class="badge badge-outline">{it.language}</span>
					{/if}
				</div>

				<div class="mt-3 flex items-baseline gap-2">
					<p class="text-lg font-extrabold text-[var(--ink)]">{prompt}</p>
				</div>
				<div class="mt-1 flex items-baseline gap-2">
					<span class="text-xs font-extrabold uppercase tracking-wide text-[var(--silver)]">→</span>
					<p class="font-bold text-[var(--graphite)]">{answer}</p>
				</div>

				{#if it.alternates?.length}
					<div class="mt-2 flex flex-wrap gap-1.5">
						{#each it.alternates as alt (alt)}
							<span class="badge badge-outline" style="font-size:.6875rem">{alt}</span>
						{/each}
					</div>
				{/if}

				{#if t === 'multiple_choice' && it.choices?.length}
					<div class="mt-3 grid grid-cols-2 gap-1.5">
						{#each it.choices as choice (choice)}
							<div
								class="rounded-md border px-2 py-1 text-xs font-bold"
								class:bg-edu-light={choice === answer}
								style:border-color={choice === answer ? 'var(--edukits-blue-bright)' : 'var(--cloud)'}
								style:color={choice === answer ? 'var(--edukits-blue-deep)' : 'var(--graphite)'}
								style:background={choice === answer ? 'var(--edukits-blue-light)' : 'transparent'}
							>
								{choice}{#if choice === answer}<span class="ml-1">✓</span>{/if}
							</div>
						{/each}
					</div>
				{/if}

				{#if it.explanation}
					<p class="mt-3 border-t border-[var(--cloud-soft)] pt-2 text-xs font-semibold italic text-[var(--silver)]">
						{it.explanation}
					</p>
				{/if}
			</article>
		{:else}
			<div class="empty-state md:col-span-2">
				<h3>{query || typeFilter !== 'all' ? 'No matches' : 'No drills yet'}</h3>
				<p>
					{query || typeFilter !== 'all'
						? 'Try clearing your search or filter.'
						: 'Add a single drill or paste a JSON batch to make this lesson playable.'}
				</p>
				{#if !(query || typeFilter !== 'all')}
					<div class="flex gap-2 mt-2">
						<button class="btn btn-primary" onclick={() => { mode = 'single'; drawerOpen = true; }}>+ Add drill</button>
						<button class="btn" onclick={() => { mode = 'bulk'; drawerOpen = true; }}>Bulk import</button>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>

<Drawer bind:open={drawerOpen} title={mode === 'single' ? 'Add drill' : 'Bulk import drills'}>
	<div class="mb-4 tabs" role="tablist">
		<button class="tab {mode === 'single' ? 'tab--active' : ''}" onclick={() => (mode = 'single')}>
			Single drill
		</button>
		<button class="tab {mode === 'bulk' ? 'tab--active' : ''}" onclick={() => (mode = 'bulk')}>
			Bulk JSON
		</button>
	</div>

	{#if mode === 'single'}
		<form id="drill-form" class="flex flex-col gap-4" onsubmit={submitSingle}>
			<label class="form-field">
				Type
				<select bind:value={single.type}>
					<option value="translate">Translate</option>
					<option value="multiple_choice">Multiple choice</option>
					<option value="fill_blank">Fill in the blank</option>
					<option value="transform">Transform</option>
				</select>
			</label>
			<label class="form-field">
				Prompt
				<input type="text" bind:value={single.prompt} required placeholder="bonjour" />
				<span class="form-field-hint">What the learner sees.</span>
			</label>
			<label class="form-field">
				Answer
				<input type="text" bind:value={single.answer} required placeholder="hello" />
			</label>
			<label class="form-field">
				Alternates
				<input type="text" bind:value={single.alternatesText} placeholder="good morning, hi" />
				<span class="form-field-hint">Comma or newline separated. Accepted as correct.</span>
			</label>
			{#if single.type === 'multiple_choice'}
				<label class="form-field">
					Choices
					<textarea rows="3" bind:value={single.choicesText} placeholder="hello&#10;goodbye&#10;please&#10;thanks"></textarea>
					<span class="form-field-hint">One per line (or comma-separated). Include the correct answer.</span>
				</label>
			{/if}
			<label class="form-field">
				Explanation
				<textarea rows="2" bind:value={single.explanation} placeholder="Optional teaching note."></textarea>
			</label>
			<label class="form-field">
				Language
				<input type="text" bind:value={single.language} placeholder="fr" />
			</label>
			{#if errorMessage}
				<div class="banner banner-error">{errorMessage}</div>
			{/if}
		</form>
	{:else}
		<form id="drill-bulk-form" class="flex flex-col gap-3" onsubmit={submitBulk}>
			<p class="text-sm text-[var(--graphite)]">
				Paste an array of drill objects. They append to the end of this lesson in given order.
			</p>
			<textarea bind:value={itemsJson} rows="20" class="code-box" spellcheck="false"></textarea>
			{#if errorMessage}
				<div class="banner banner-error">{errorMessage}</div>
			{/if}
		</form>
	{/if}

	{#snippet footer()}
		<button type="button" class="btn" onclick={() => (drawerOpen = false)}>Cancel</button>
		{#if mode === 'single'}
			<button type="submit" form="drill-form" class="btn btn-primary" disabled={saving}>
				{saving ? 'Saving…' : 'Add drill'}
			</button>
		{:else}
			<button type="submit" form="drill-bulk-form" class="btn btn-primary" disabled={saving}>
				{saving ? 'Importing…' : 'Import'}
			</button>
		{/if}
	{/snippet}
</Drawer>
