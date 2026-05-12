<script>
	let { data } = $props();

	let saving = $state(false);
	let message = $state('');
	let errorMessage = $state('');

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
			message = 'Lesson saved. Reload to refresh the list.';
			form.reset();
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

<div class="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
	<section class="surface-card p-6">
		<a href="/admin/courses/{data.course.slug}/units" class="text-link">Back to units</a>
		<p class="eyebrow mt-5">Lessons</p>
		<h2 class="mt-2 text-2xl font-extrabold">{data.unit.name}</h2>
		<p class="mt-2 text-[var(--graphite)]">{data.unit.description}</p>

		<div class="mt-5 grid gap-3">
			{#each data.lessons ?? [] as lesson (lesson.id)}
				<a
					href="/admin/courses/{data.course.slug}/units/{data.unit
						.slug}/lessons/{lesson.slug}/items"
					class="interactive-card block p-4"
				>
					<h3 class="text-lg font-extrabold">{lesson.name}</h3>
					<p class="mt-1 text-[var(--graphite)]">{lesson.description}</p>
					<p class="mt-2 text-sm font-bold text-[var(--silver)]">
						/{lesson.slug} · {lesson.kind} · {lesson.xpReward} XP · order {lesson.order}
					</p>
				</a>
			{:else}
				<p class="rounded-xl border border-dashed border-[var(--cloud)] p-4 text-[var(--graphite)]">
					Add a lesson before importing drill items.
				</p>
			{/each}
		</div>
	</section>

	<form class="surface-card flex flex-col gap-4 p-6" onsubmit={createLesson}>
		<p class="eyebrow">Create lesson</p>
		<label class="form-field">
			Name
			<input name="name" type="text" required placeholder="Bonjour" />
		</label>
		<label class="form-field">
			Slug
			<input name="slug" type="text" placeholder="bonjour" />
		</label>
		<label class="form-field">
			Description
			<input name="description" type="text" required placeholder="First greetings." />
		</label>
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
		<label class="form-field">
			Order
			<input name="order" type="text" inputmode="numeric" required value="1" />
		</label>
		<button class="btn btn-primary" disabled={saving}
			>{saving ? 'Saving...' : 'Create lesson'}</button
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

	select {
		min-height: 2.75rem;
		border: 1px solid var(--cloud);
		border-radius: 12px;
		background: var(--snow);
		padding: 0.625rem 0.875rem;
		color: var(--ink);
		font-weight: 700;
	}
</style>
