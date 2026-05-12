<script>
	let { data } = $props();

	let courses = $derived(data.courses ?? []);
	let saving = $state(false);
	let message = $state('');
	let errorMessage = $state('');

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
			message = 'Course saved. Reload to see generated slugs if needed.';
			form.reset();
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

<div class="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
	<section class="surface-card p-6">
		<div class="flex items-center justify-between gap-4">
			<div>
				<p class="eyebrow">Courses</p>
				<h2 class="mt-2 text-2xl font-extrabold">Learning paths</h2>
			</div>
			<p class="soft-pill px-4 py-2">{courses.length} total</p>
		</div>

		<div class="mt-5 grid gap-3">
			{#each courses as course (course.id)}
				<a href="/admin/courses/{course.slug}/units" class="interactive-card block p-4">
					<h3 class="text-lg font-extrabold">{course.name}</h3>
					<p class="mt-1 text-[var(--graphite)]">{course.description}</p>
					<p class="mt-2 text-sm font-bold text-[var(--silver)]">
						/{course.slug} · {course.language} · order {course.order}
					</p>
				</a>
			{:else}
				<p class="rounded-xl border border-dashed border-[var(--cloud)] p-4 text-[var(--graphite)]">
					Create your first course to unlock unit management.
				</p>
			{/each}
		</div>
	</section>

	<form class="surface-card flex flex-col gap-4 p-6" onsubmit={createCourse}>
		<p class="eyebrow">Create course</p>
		<label class="form-field">
			Name
			<input name="name" type="text" required placeholder="French Foundations" />
		</label>
		<label class="form-field">
			Slug
			<input name="slug" type="text" placeholder="french" />
		</label>
		<label class="form-field">
			Description
			<input name="description" type="text" required placeholder="A practical French path." />
		</label>
		<label class="form-field">
			Language
			<input name="language" type="text" required placeholder="fr" />
		</label>
		<label class="form-field">
			Order
			<input name="order" type="text" inputmode="numeric" required value="1" />
		</label>
		<button class="btn btn-primary" disabled={saving}
			>{saving ? 'Saving...' : 'Create course'}</button
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
