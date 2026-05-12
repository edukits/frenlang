<script>
	let { data } = $props();
	let skillTree = $derived(data.skillTree);
	let units = $derived(skillTree?.units ?? []);

	/** @param {number} stars */
	function starText(stars) {
		return '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
	}
</script>

<svelte:head>
	<title>Learn French | Frenlang</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="eyebrow">French path</p>
			<h1 class="page-heading text-4xl">{skillTree?.course?.name ?? 'Learn French'}</h1>
			<p class="mt-2 max-w-2xl text-[var(--graphite)]">
				{skillTree?.course?.description ?? 'Complete lessons in order to unlock the next step.'}
			</p>
		</div>
		<a href="/review" class="btn">Review due cards</a>
	</div>

	{#if units.length === 0}
		<div class="surface-card p-6 text-center">
			<p class="eyebrow">No lessons yet</p>
			<h2 class="mt-2 text-2xl font-extrabold">Build the first unit in Admin.</h2>
			<p class="mx-auto mt-2 max-w-xl text-[var(--graphite)]">
				Courses, units, lessons, and items appear here as soon as they are created.
			</p>
			<a href="/admin" class="btn btn-primary mt-5">Open admin</a>
		</div>
	{:else}
		<div class="flex flex-col gap-10">
			{#each units as unit (unit.id)}
				<section class="surface-card p-5 md:p-6">
					<div class="mb-6">
						<p class="eyebrow">Unit {unit.order}</p>
						<h2 class="text-2xl font-extrabold">{unit.name}</h2>
						<p class="mt-1 text-[var(--graphite)]">{unit.description}</p>
					</div>

					<div class="lesson-path">
						{#each unit.lessons as lesson, index (lesson.id)}
							<div class="lesson-step" style:--offset={`${index % 2 === 0 ? 0 : 2.5}rem`}>
								{#if lesson.status === 'locked'}
									<button
										class="lesson-node lesson-node--locked"
										disabled
										aria-label={`${lesson.name} locked`}
									>
										<span>{lesson.order}</span>
									</button>
								{:else}
									<a
										href="/learn/lesson/{lesson.id}"
										class={[
											'lesson-node',
											lesson.status === 'completed' && 'lesson-node--completed'
										]}
										aria-label={`${lesson.name}, ${lesson.status}`}
									>
										<span>{lesson.status === 'completed' ? '✓' : lesson.order}</span>
									</a>
								{/if}
								<div class="lesson-meta">
									<h3>{lesson.name}</h3>
									<p>{lesson.kind} · {lesson.xpReward} XP</p>
									<p class="stars" aria-label={`${lesson.stars ?? 0} out of 3 stars`}>
										{starText(lesson.stars ?? 0)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}
</div>

<style>
	.lesson-path {
		display: grid;
		gap: 1.25rem;
	}

	.lesson-step {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		align-items: center;
		margin-left: var(--offset);
	}

	.lesson-node {
		display: inline-flex;
		width: 4.5rem;
		height: 4.5rem;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--edukits-blue-bright);
		border-radius: 999px;
		background: var(--edukits-blue);
		box-shadow: 0 5px 0 var(--edukits-blue-deep);
		color: var(--snow);
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 600;
	}

	.lesson-node:hover {
		background: var(--edukits-blue-bright);
	}

	.lesson-node--completed {
		border-color: var(--mint);
		background: var(--mint);
		box-shadow: 0 5px 0 #168257;
	}

	.lesson-node--locked {
		border-color: var(--cloud);
		background: var(--cloud-soft);
		box-shadow: none;
		color: var(--silver);
	}

	.lesson-meta h3 {
		font-size: 1.125rem;
		font-weight: 800;
	}

	.lesson-meta p {
		color: var(--graphite);
		font-weight: 700;
	}

	.lesson-meta .stars {
		color: var(--sunshine);
		letter-spacing: 0.08em;
	}

	@media (max-width: 640px) {
		.lesson-step {
			margin-left: 0;
		}
	}
</style>
