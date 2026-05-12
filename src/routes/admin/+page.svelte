<script>
	let { data } = $props();

	const ingestExample = {
		course: {
			slug: 'french',
			name: 'French Foundations',
			description: 'A practical French path for beginners.',
			language: 'fr',
			order: 1
		},
		units: [
			{
				slug: 'basics',
				name: 'Basics',
				description: 'Greetings and core phrases.',
				order: 1,
				lessons: [
					{
						slug: 'bonjour',
						name: 'Bonjour',
						description: 'First greetings.',
						order: 1,
						kind: 'vocabulary',
						xpReward: 15,
						items: [
							{
								prompt: 'bonjour',
								answer: 'hello',
								alternates: ['good morning'],
								type: 'translate',
								choices: ['hello', 'goodbye', 'please', 'thanks'],
								explanation: 'Bonjour is the standard daytime greeting.',
								language: 'fr'
							}
						]
					}
				]
			}
		]
	};

	let jsonExample = JSON.stringify(ingestExample, null, 2);
	let curlExample =
		$derived(`curl -X POST "https://<your-convex-deployment>.convex.site/admin/ingest" \\
  -H "Authorization: Bearer $ADMIN_INGEST_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data '${jsonExample.replaceAll("'", "'\\''")}'`);
</script>

<svelte:head>
	<title>Admin | Frenlang</title>
</svelte:head>

<div class="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
	<section class="surface-card p-6">
		<p class="eyebrow">Overview</p>
		<h2 class="mt-2 text-2xl font-extrabold">Course content</h2>
		<p class="mt-2 text-[var(--graphite)]">
			Manage the Duolingo-style path from courses down to individual drill items.
		</p>
		<div class="mt-5 grid gap-3">
			{#each data.courses ?? [] as course (course.id)}
				<a href="/admin/courses/{course.slug}/units" class="interactive-card block p-4">
					<h3 class="font-extrabold">{course.name}</h3>
					<p class="text-sm font-bold text-[var(--silver)]">
						{course.language} · order {course.order}
					</p>
				</a>
			{:else}
				<p class="rounded-xl border border-dashed border-[var(--cloud)] p-4 text-[var(--graphite)]">
					No courses yet. Create one from the Courses page or use ingestion.
				</p>
			{/each}
		</div>
	</section>

	<section class="surface-card p-6">
		<p class="eyebrow">Bulk ingestion</p>
		<h2 class="mt-2 text-2xl font-extrabold">Convex HTTP import</h2>
		<p class="mt-2 text-[var(--graphite)]">
			Send curated content to the Convex deployment with a bearer token stored outside the UI.
		</p>

		<label class="mt-5 flex flex-col gap-2 font-extrabold">
			JSON shape
			<textarea readonly rows="16" class="code-box">{jsonExample}</textarea>
		</label>

		<label class="mt-4 flex flex-col gap-2 font-extrabold">
			curl example
			<textarea readonly rows="8" class="code-box">{curlExample}</textarea>
		</label>
	</section>
</div>

<style>
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
