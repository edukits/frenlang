<script>
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data } = $props();

	let courses = $derived(data.courses ?? []);

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

	const jsonExample = JSON.stringify(ingestExample, null, 2);
	const curlExample = `curl -X POST "https://<your-convex-deployment>.convex.site/admin/ingest" \\
  -H "Authorization: Bearer $ADMIN_INGEST_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data @ingest.json`;

	let showIngest = $state(false);

	let copyState = $state('');
	/** @param {string} value */
	async function copy(value) {
		try {
			await navigator.clipboard.writeText(value);
			copyState = 'Copied!';
			setTimeout(() => (copyState = ''), 1500);
		} catch {
			copyState = 'Copy failed';
		}
	}
</script>

<svelte:head>
	<title>Admin | Frenlang</title>
</svelte:head>

<Breadcrumbs items={[{ href: '/admin', label: 'Admin' }, { label: 'Overview' }]} />

<header class="page-header">
	<div>
		<p class="eyebrow">Content Studio</p>
		<h1 class="page-heading text-4xl">Overview</h1>
		<p class="mt-2 max-w-2xl text-[var(--graphite)]">
			Author the learning path from courses to drills. Use the sidebar to jump between sections, or
			start with a course below.
		</p>
	</div>
	<div class="flex flex-wrap gap-2">
		<a href="/admin/courses" class="btn btn-secondary">Manage courses</a>
		<button class="btn btn-primary" onclick={() => (showIngest = !showIngest)}>
			{showIngest ? 'Hide bulk import' : 'Bulk import'}
		</button>
	</div>
</header>

<section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
	<div class="stat-card">
		<span class="stat-label">Courses</span>
		<span class="stat-value">{courses.length}</span>
		<span class="stat-hint">Active learning paths</span>
	</div>
	<div class="stat-card">
		<span class="stat-label">Languages</span>
		<span class="stat-value">{new Set(courses.map((c) => c.language)).size}</span>
		<span class="stat-hint">Targeted by content</span>
	</div>
	<div class="stat-card">
		<span class="stat-label">Highest order</span>
		<span class="stat-value">{courses.reduce((m, c) => Math.max(m, c.order), 0)}</span>
		<span class="stat-hint">Sequencing slot in use</span>
	</div>
	<div class="stat-card">
		<span class="stat-label">Quick action</span>
		<a href="/admin/courses" class="btn btn-primary mt-1" style="min-height: 2.25rem; padding:.4rem .75rem">
			+ New course
		</a>
	</div>
</section>

<section class="surface-card p-6">
	<div class="flex items-center justify-between gap-4">
		<div>
			<p class="eyebrow">Recent courses</p>
			<h2 class="mt-1 text-xl font-extrabold">Jump in and edit</h2>
		</div>
		<a href="/admin/courses" class="text-link text-sm">View all →</a>
	</div>

	<div class="mt-5 grid gap-3 md:grid-cols-2">
		{#each courses.slice(0, 6) as course (course.id)}
			<a href="/admin/courses/{course.slug}/units" class="interactive-card block p-4">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0">
						<h3 class="truncate font-extrabold text-[var(--ink)]">{course.name}</h3>
						<p class="mt-1 line-clamp-2 text-sm text-[var(--graphite)]">{course.description}</p>
					</div>
					<span class="badge badge-info shrink-0">{course.language}</span>
				</div>
				<div class="mt-3 flex items-center gap-2 text-xs font-bold text-[var(--silver)]">
					<span class="badge badge-outline">/{course.slug}</span>
					<span>·</span>
					<span>order {course.order}</span>
				</div>
			</a>
		{:else}
			<div class="empty-state md:col-span-2">
				<h3>No courses yet</h3>
				<p>Create your first French path to unlock unit, lesson, and drill editing.</p>
				<a href="/admin/courses" class="btn btn-primary mt-2">+ Create a course</a>
			</div>
		{/each}
	</div>
</section>

{#if showIngest}
	<section class="surface-card p-6">
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="eyebrow">Bulk ingestion</p>
				<h2 class="mt-1 text-xl font-extrabold">Convex HTTP import</h2>
				<p class="mt-2 max-w-2xl text-sm text-[var(--graphite)]">
					Push curated content directly to your Convex deployment. Authenticate with the
					<code class="rounded bg-[var(--cloud-soft)] px-1.5 py-0.5 text-xs font-bold">ADMIN_INGEST_TOKEN</code>
					stored outside this UI.
				</p>
			</div>
			{#if copyState}
				<span class="badge badge-success">{copyState}</span>
			{/if}
		</div>

		<div class="mt-5 grid gap-5 lg:grid-cols-2">
			<div>
				<div class="flex items-center justify-between">
					<p class="eyebrow">JSON shape</p>
					<button class="btn" style="min-height:2rem; padding:.25rem .625rem" onclick={() => copy(jsonExample)}>
						Copy
					</button>
				</div>
				<textarea readonly rows="16" class="code-box mt-2">{jsonExample}</textarea>
			</div>
			<div>
				<div class="flex items-center justify-between">
					<p class="eyebrow">curl example</p>
					<button class="btn" style="min-height:2rem; padding:.25rem .625rem" onclick={() => copy(curlExample)}>
						Copy
					</button>
				</div>
				<textarea readonly rows="8" class="code-box mt-2">{curlExample}</textarea>
				<div class="mt-4 rounded-xl border border-[var(--cloud)] bg-[var(--cloud-soft)] p-3 text-sm">
					<p class="font-extrabold text-[var(--ink)]">Tip</p>
					<p class="mt-1 text-[var(--graphite)]">
						Ingestion is idempotent: matching slugs are updated, new ones are inserted. Safe to run
						the same payload twice.
					</p>
				</div>
			</div>
		</div>
	</section>
{/if}
