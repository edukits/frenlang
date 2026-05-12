<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let lessons = $derived(data.lessons ?? []);
	let saving = $state(false);
	let message = $state('');
	let errorMessage = $state('');
	let drawerOpen = $state(false);

	/** @param {string} kind */
	function kindBadge(kind) {
		if (kind === 'vocabulary') return 'badge-info';
		if (kind === 'grammar') return 'badge-violet';
		return 'badge-warn';
	}

	/** @param {SubmitEvent} event */
	async function createLesson(event) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const formData = new FormData(form);
		const body = {
			unitId: data.unit.id,
			name: String(formData.get('name') ?? ''),
			slug: String(formData.get('slug') ?? ''),
			description: String(formData.get('description') ?? ''),
			kind: String(formData.get('kind') ?? 'vocabulary'),
			order: Number(formData.get('order') ?? 0),
			xpReward: Number(formData.get('xpReward') ?? 0)
		};

		saving = true;
		message = '';
		errorMessage = '';
		try {
			const response = await fetch('/admin/api/lessons', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) throw new Error('Could not create lesson.');
			message = `Lesson “${body.name}” saved.`;
			form.reset();
			drawerOpen = false;
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not create lesson.';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{data.unit.name} Lessons | Frenlang Admin</title>
</svelte:head>

<Breadcrumbs
	items={[
		{ href: '/admin', label: 'Admin' },
		{ href: '/admin/courses', label: 'Courses' },
		{ href: `/admin/courses/${data.course.slug}/units`, label: data.course.name },
		{ label: data.unit.name }
	]}
/>

<header class="page-header">
	<div>
		<p class="eyebrow">{data.course.name} · {data.unit.name} · Lessons</p>
		<h1 class="page-heading text-4xl">{data.unit.name}</h1>
		<p class="mt-2 max-w-2xl text-[var(--graphite)]">{data.unit.description}</p>
		<div class="mt-3 flex flex-wrap gap-2 text-xs">
			<span class="badge badge-outline">/{data.unit.slug}</span>
			<span class="badge">order {data.unit.order}</span>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<span class="badge badge-outline">{lessons.length} lessons</span>
		<button class="btn btn-primary" onclick={() => (drawerOpen = true)}>+ New lesson</button>
	</div>
</header>

{#if message}
	<div class="banner banner-success">{message}</div>
{/if}

<section class="surface-card overflow-hidden">
	<div class="grid grid-cols-1 divide-y divide-[var(--cloud-soft)]">
		{#each lessons as lesson, i (lesson.id)}
			<a
				href="/admin/courses/{data.course.slug}/units/{data.unit.slug}/lessons/{lesson.slug}/items"
				class="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 transition-colors hover:bg-[var(--edukits-blue-light)]"
			>
				<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cloud-soft)] font-extrabold text-[var(--graphite)]">
					{i + 1}
				</div>
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<h3 class="truncate text-base font-extrabold text-[var(--ink)]">{lesson.name}</h3>
						<span class="badge {kindBadge(lesson.kind)}">{lesson.kind}</span>
						<span class="badge badge-outline">{lesson.xpReward} XP</span>
					</div>
					<p class="mt-1 line-clamp-1 text-sm text-[var(--graphite)]">{lesson.description}</p>
					<p class="mt-1 text-xs font-bold text-[var(--silver)]">/{lesson.slug} · order {lesson.order}</p>
				</div>
				<span class="text-[var(--edukits-blue-deep)] font-extrabold">→</span>
			</a>
		{:else}
			<div class="empty-state">
				<h3>No lessons yet</h3>
				<p>Build short, focused lessons. Each can carry vocabulary, grammar drills, or both.</p>
				<button class="btn btn-primary mt-2" onclick={() => (drawerOpen = true)}>+ Create lesson</button>
			</div>
		{/each}
	</div>
</section>

<Drawer bind:open={drawerOpen} title="Create lesson">
	<form id="lesson-form" class="flex flex-col gap-4" onsubmit={createLesson}>
		<label class="form-field">
			Name
			<input name="name" type="text" required placeholder="Bonjour" />
		</label>
		<label class="form-field">
			Slug
			<input name="slug" type="text" placeholder="bonjour" />
			<span class="form-field-hint">Auto-generated from name when blank.</span>
		</label>
		<label class="form-field">
			Description
			<input name="description" type="text" required placeholder="First greetings." />
		</label>
		<div class="grid grid-cols-2 gap-3">
			<label class="form-field">
				Kind
				<select name="kind" required>
					<option value="vocabulary">Vocabulary</option>
					<option value="grammar">Grammar</option>
					<option value="mixed">Mixed</option>
				</select>
			</label>
			<label class="form-field">
				XP reward
				<input name="xpReward" type="text" inputmode="numeric" required value="15" />
			</label>
		</div>
		<label class="form-field">
			Order
			<input name="order" type="text" inputmode="numeric" required value={String(lessons.length + 1)} />
		</label>
		{#if errorMessage}
			<div class="banner banner-error">{errorMessage}</div>
		{/if}
	</form>
	{#snippet footer()}
		<button type="button" class="btn" onclick={() => (drawerOpen = false)}>Cancel</button>
		<button type="submit" form="lesson-form" class="btn btn-primary" disabled={saving}>
			{saving ? 'Saving…' : 'Create lesson'}
		</button>
	{/snippet}
</Drawer>
