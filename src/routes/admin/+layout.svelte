<script>
	let { children } = $props();
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
	<div
		class="flex flex-col justify-between gap-4 border-b border-[var(--cloud-soft)] pb-4 md:flex-row md:items-end"
	>
		<div>
			<p class="eyebrow">Admin</p>
			<h1 class="page-heading text-4xl">Content studio</h1>
		</div>
		<nav class="flex flex-wrap gap-2" aria-label="Admin sections">
			<a href="/admin" class="btn">Overview</a>
			<a href="/admin/courses" class="btn">Courses</a>
		</nav>
	</div>

	{@render children()}
</div>
