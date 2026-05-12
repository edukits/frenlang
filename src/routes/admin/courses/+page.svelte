<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let courses = $derived(data.courses ?? []);
	let saving = $state(false);
	let message = $state('');
	let errorMessage = $state('');
	let drawerOpen = $state(false);
	let query = $state('');

	let filtered = $derived(
		query
			? courses.filter((c) => {
					const q = query.toLowerCase();
					return (
						c.name.toLowerCase().includes(q) ||
						c.slug.toLowerCase().includes(q) ||
						c.description.toLowerCase().includes(q)
					);
				})
			: courses
	);

	/** @param {SubmitEvent} event */
	async function createCourse(event) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const formData = new FormData(form);
		const body = {
			name: String(formData.get('name') ?? ''),
			slug: String(formData.get('slug') ?? ''),
			description: String(formData.get('description') ?? ''),
			language: String(formData.get('language') ?? ''),
			order: Number(formData.get('order') ?? 0)
		};

		saving = true;
		message = '';
		errorMessage = '';
		try {
			const response = await fetch('/admin/api/courses', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) throw new Error('Could not create course.');
			message = `Course “${body.name}” saved.`;
			form.reset();
			drawerOpen = false;
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not create course.';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Courses | Frenlang Admin</title>
</svelte:head>

<Breadcrumbs items={[{ href: '/admin', label: 'Admin' }, { label: 'Courses' }]} />

<header class="page-header">
	<div>
		<p class="eyebrow">Catalog</p>
		<h1 class="page-heading text-4xl">Courses</h1>
		<p class="mt-2 text-[var(--graphite)]">
			Each course bundles units, lessons, and drills into a single learning path.
		</p>
	</div>
	<div class="flex items-center gap-2">
		<span class="badge badge-outline">{courses.length} total</span>
		<button class="btn btn-primary" onclick={() => (drawerOpen = true)}>+ New course</button>
	</div>
</header>

{#if message}
	<div class="banner banner-success">{message}</div>
{/if}

<section class="surface-card p-2 md:p-3">
	<div class="flex flex-col gap-2 px-3 py-2 md:flex-row md:items-center md:justify-between">
		<div class="relative w-full md:max-w-xs">
			<input
				type="text"
				placeholder="Search courses…"
				bind:value={query}
				class="w-full"
				aria-label="Search courses"
			/>
		</div>
		<p class="text-xs font-bold text-[var(--silver)]">
			Showing {filtered.length} of {courses.length}
		</p>
	</div>

	<div class="grid gap-2 p-1 md:grid-cols-2">
		{#each filtered as course (course.id)}
			<a href="/admin/courses/{course.slug}/units" class="interactive-card block p-4">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0">
						<h3 class="truncate text-lg font-extrabold text-[var(--ink)]">{course.name}</h3>
						<p class="mt-1 line-clamp-2 text-sm text-[var(--graphite)]">{course.description}</p>
					</div>
					<span class="badge badge-info shrink-0">{course.language}</span>
				</div>
				<div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
					<span class="badge badge-outline">/{course.slug}</span>
					<span class="badge">order {course.order}</span>
					<span class="ml-auto text-[var(--edukits-blue-deep)] font-extrabold">Open →</span>
				</div>
			</a>
		{:else}
			<div class="empty-state md:col-span-2">
				<h3>{query ? 'No matches' : 'No courses yet'}</h3>
				<p>{query ? 'Try a different search term.' : 'Create your first French course to get started.'}</p>
				{#if !query}
					<button class="btn btn-primary mt-2" onclick={() => (drawerOpen = true)}>+ Create course</button>
				{/if}
			</div>
		{/each}
	</div>
</section>

<Drawer bind:open={drawerOpen} title="Create course">
	<form id="course-form" class="flex flex-col gap-4" onsubmit={createCourse}>
		<label class="form-field">
			Name
			<input name="name" type="text" required placeholder="French Foundations" />
		</label>
		<label class="form-field">
			Slug
			<input name="slug" type="text" placeholder="french" />
			<span class="form-field-hint">Optional — auto-generated from name if blank.</span>
		</label>
		<label class="form-field">
			Description
			<input name="description" type="text" required placeholder="A practical French path for beginners." />
		</label>
		<div class="grid grid-cols-2 gap-3">
			<label class="form-field">
				Language
				<input name="language" type="text" required placeholder="fr" />
			</label>
			<label class="form-field">
				Order
				<input name="order" type="text" inputmode="numeric" required value="1" />
			</label>
		</div>
		{#if errorMessage}
			<div class="banner banner-error">{errorMessage}</div>
		{/if}
	</form>
	{#snippet footer()}
		<button type="button" class="btn" onclick={() => (drawerOpen = false)}>Cancel</button>
		<button type="submit" form="course-form" class="btn btn-primary" disabled={saving}>
			{saving ? 'Saving…' : 'Create course'}
		</button>
	{/snippet}
</Drawer>
