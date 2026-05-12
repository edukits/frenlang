<script>
	import { page } from '$app/state';

	let { data, children } = $props();

	let courses = $derived(data.courses ?? []);
	let pathname = $derived(page.url.pathname);

	let activeCourseSlug = $derived(page.params.course ?? null);

	/** @param {string} href */
	function isActive(href) {
		if (href === '/admin') return pathname === '/admin';
		return pathname === href || pathname.startsWith(href + '/');
	}
</script>

<div class="admin-shell">
	<aside class="admin-sidebar">
		<div class="admin-brand">
			<div class="admin-brand-mark" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none">
					<path d="M4 6h16M4 12h12M4 18h8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
				</svg>
			</div>
			<div>
				<p class="eyebrow" style="font-size:.625rem">Frenlang</p>
				<p class="admin-brand-title">Content Studio</p>
			</div>
		</div>

		<nav class="side-nav" aria-label="Admin sections">
			<p class="side-nav-section">Workspace</p>
			<a href="/admin" class="side-nav-link {isActive('/admin') && pathname === '/admin' ? 'side-nav-link--active' : ''}">
				<span class="flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.6"/>
						<rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.6"/>
						<rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.6"/>
						<rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.6"/>
					</svg>
					Overview
				</span>
			</a>
			<a href="/admin/courses" class="side-nav-link {pathname.startsWith('/admin/courses') ? 'side-nav-link--active' : ''}">
				<span class="flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M2 4.5C2 3.67 2.67 3 3.5 3H7v10H3.5C2.67 13 2 12.33 2 11.5v-7Z" stroke="currentColor" stroke-width="1.6"/>
						<path d="M14 4.5C14 3.67 13.33 3 12.5 3H9v10h3.5c.83 0 1.5-.67 1.5-1.5v-7Z" stroke="currentColor" stroke-width="1.6"/>
					</svg>
					Courses
				</span>
				<span class="side-nav-count">{courses.length}</span>
			</a>

			{#if courses.length}
				<p class="side-nav-section mt-3">Courses</p>
				{#each courses as course (course.id)}
					<a
						href="/admin/courses/{course.slug}/units"
						class="side-nav-link {activeCourseSlug === course.slug ? 'side-nav-link--active' : ''}"
					>
						<span class="truncate">{course.name}</span>
						<span class="badge badge-outline" style="font-size:.625rem; padding:0 .375rem">{course.language}</span>
					</a>
				{/each}
			{/if}

			<p class="side-nav-section mt-3">Tools</p>
			<a href="/" class="side-nav-link">
				<span class="flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M8 2L2 7v7h12V7L8 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
					</svg>
					Back to app
				</span>
			</a>
		</nav>

		<div class="admin-sidebar-footer">
			<p class="eyebrow" style="font-size:.625rem">Signed in as</p>
			<p class="text-sm font-extrabold text-[var(--ink)] truncate">{data.profile?.email ?? 'admin'}</p>
			<span class="badge badge-success mt-1">Admin</span>
		</div>
	</aside>

	<div class="admin-main">
		{@render children()}
	</div>
</div>

<style>
	.admin-shell {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		width: 100%;
		min-height: 0;
		flex: 1;
	}

	@media (min-width: 1024px) {
		.admin-shell {
			grid-template-columns: 260px minmax(0, 1fr);
		}
	}

	.admin-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border: 1px solid var(--cloud);
		background: var(--snow);
		border-radius: 16px;
		padding: 1rem;
		height: fit-content;
		position: sticky;
		top: 5.5rem;
	}

	.admin-brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.25rem 0.5rem 0.75rem;
		border-bottom: 1px solid var(--cloud-soft);
	}

	.admin-brand-mark {
		width: 2rem;
		height: 2rem;
		border-radius: 9px;
		background: var(--edukits-blue-light);
		color: var(--edukits-blue-deep);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.admin-brand-title {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--ink);
		font-size: 1rem;
		line-height: 1.1;
	}

	.admin-sidebar-footer {
		margin-top: auto;
		padding: 0.75rem;
		border-top: 1px solid var(--cloud-soft);
	}

	.admin-main {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		min-width: 0;
	}
</style>
