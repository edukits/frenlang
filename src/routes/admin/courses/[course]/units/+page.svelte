<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let units = $derived(data.units ?? []);
	let saving = $state(false);
	let message = $state('');
	let errorMessage = $state('');
	let drawerOpen = $state(false);

	/** @param {SubmitEvent} event */
	async function createUnit(event) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const formData = new FormData(form);
		const body = {
			courseId: data.course.id,
			name: String(formData.get('name') ?? ''),
			slug: String(formData.get('slug') ?? ''),
			description: String(formData.get('description') ?? ''),
			order: Number(formData.get('order') ?? 0)
		};

		saving = true;
		message = '';
		errorMessage = '';
		try {
			const response = await fetch('/admin/api/units', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) throw new Error('Could not create unit.');
			message = `Unit “${body.name}” saved.`;
			form.reset();
			drawerOpen = false;
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Could not create unit.';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{data.course.name} Units | Frenlang Admin</title>
</svelte:head>

<Breadcrumbs
	items={[
		{ href: '/admin', label: 'Admin' },
		{ href: '/admin/courses', label: 'Courses' },
		{ label: data.course.name }
	]}
/>

<header class="page-header">
	<div>
		<p class="eyebrow">{data.course.name} · Units</p>
		<h1 class="page-heading text-4xl">{data.course.name}</h1>
		<p class="mt-2 max-w-2xl text-[var(--graphite)]">{data.course.description}</p>
		<div class="mt-3 flex flex-wrap gap-2 text-xs">
			<span class="badge badge-info">{data.course.language}</span>
			<span class="badge badge-outline">/{data.course.slug}</span>
			<span class="badge">order {data.course.order}</span>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<span class="badge badge-outline">{units.length} units</span>
		<button class="btn btn-primary" onclick={() => (drawerOpen = true)}>+ New unit</button>
	</div>
</header>

{#if message}
	<div class="banner banner-success">{message}</div>
{/if}

<section class="surface-card p-3">
	<div class="grid gap-2 md:grid-cols-2">
		{#each units as unit, i (unit.id)}
			<a
				href="/admin/courses/{data.course.slug}/units/{unit.slug}/lessons"
				class="interactive-card flex gap-3 p-4"
			>
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--edukits-blue-light)] font-extrabold text-[var(--edukits-blue-deep)]">
					{i + 1}
				</div>
				<div class="min-w-0 flex-1">
					<h3 class="truncate text-lg font-extrabold text-[var(--ink)]">{unit.name}</h3>
					<p class="mt-1 line-clamp-2 text-sm text-[var(--graphite)]">{unit.description}</p>
					<div class="mt-2 flex flex-wrap gap-2 text-xs">
						<span class="badge badge-outline">/{unit.slug}</span>
						<span class="badge">order {unit.order}</span>
					</div>
				</div>
				<span class="self-center text-[var(--edukits-blue-deep)] font-extrabold">→</span>
			</a>
		{:else}
			<div class="empty-state md:col-span-2">
				<h3>No units yet</h3>
				<p>Group lessons into units like “Basics”, “Travel”, or “Food”.</p>
				<button class="btn btn-primary mt-2" onclick={() => (drawerOpen = true)}>+ Create unit</button>
			</div>
		{/each}
	</div>
</section>

<Drawer bind:open={drawerOpen} title="Create unit">
	<form id="unit-form" class="flex flex-col gap-4" onsubmit={createUnit}>
		<label class="form-field">
			Name
			<input name="name" type="text" required placeholder="Basics" />
		</label>
		<label class="form-field">
			Slug
			<input name="slug" type="text" placeholder="basics" />
			<span class="form-field-hint">Auto-generated from name when blank.</span>
		</label>
		<label class="form-field">
			Description
			<input name="description" type="text" required placeholder="Core greetings and phrases." />
		</label>
		<label class="form-field">
			Order
			<input name="order" type="text" inputmode="numeric" required value={String(data.units?.length ? data.units.length + 1 : 1)} />
		</label>
		{#if errorMessage}
			<div class="banner banner-error">{errorMessage}</div>
		{/if}
	</form>
	{#snippet footer()}
		<button type="button" class="btn" onclick={() => (drawerOpen = false)}>Cancel</button>
		<button type="submit" form="unit-form" class="btn btn-primary" disabled={saving}>
			{saving ? 'Saving…' : 'Create unit'}
		</button>
	{/snippet}
</Drawer>
