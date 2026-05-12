<script>
	let { data } = $props();

	let saving = $state(false);
	let message = $state('');
	let errorMessage = $state('');

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
			message = 'Unit saved. Reload to refresh the list.';
			form.reset();
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

<div class="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
	<section class="surface-card p-6">
		<a href="/admin/courses" class="text-link">Back to courses</a>
		<p class="eyebrow mt-5">Units</p>
		<h2 class="mt-2 text-2xl font-extrabold">{data.course.name}</h2>
		<p class="mt-2 text-[var(--graphite)]">{data.course.description}</p>

		<div class="mt-5 grid gap-3">
			{#each data.units ?? [] as unit (unit.id)}
				<a
					href="/admin/courses/{data.course.slug}/units/{unit.slug}/lessons"
					class="interactive-card block p-4"
				>
					<h3 class="text-lg font-extrabold">{unit.name}</h3>
					<p class="mt-1 text-[var(--graphite)]">{unit.description}</p>
					<p class="mt-2 text-sm font-bold text-[var(--silver)]">
						/{unit.slug} · order {unit.order}
					</p>
				</a>
			{:else}
				<p class="rounded-xl border border-dashed border-[var(--cloud)] p-4 text-[var(--graphite)]">
					Add a unit to start grouping lessons.
				</p>
			{/each}
		</div>
	</section>

	<form class="surface-card flex flex-col gap-4 p-6" onsubmit={createUnit}>
		<p class="eyebrow">Create unit</p>
		<label class="form-field">
			Name
			<input name="name" type="text" required placeholder="Basics" />
		</label>
		<label class="form-field">
			Slug
			<input name="slug" type="text" placeholder="basics" />
		</label>
		<label class="form-field">
			Description
			<input name="description" type="text" required placeholder="Core greetings and phrases." />
		</label>
		<label class="form-field">
			Order
			<input name="order" type="text" inputmode="numeric" required value="1" />
		</label>
		<button class="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create unit'}</button
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
</style>
