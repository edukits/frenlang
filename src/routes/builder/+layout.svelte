<script>
	import { page } from '$app/state';

	let { children } = $props();

	const navPages = [
		{
			name: 'Dashboard',
			url: '/builder'
		},
		{
			name: 'Vocabulary',
			url: '/builder/vocabulary'
		},
		{
			name: 'Phrases',
			url: '/builder/phrases'
		},
		{
			name: 'Topics',
			url: '/builder/topics'
		},
		{
			name: 'Tools',
			url: '/builder/tools'
		}
	];

	/** @param {string} url */
	const isActive = (url) => page.url.pathname.endsWith(url);
</script>

<div class="grid grid-cols-[min-content_1fr] gap-10">
	<!-- Sidebar -->
	<div class="sidebar">
		<nav class="flex min-w-40 flex-col">
			{#each navPages as navPage (navPage.url)}
				<a
					href={navPage.url}
					class={'mb-1 rounded-md px-3 py-2 hover:bg-slate-100' +
						(isActive(navPage.url) ? ' bg-slate-200' : '')}
				>
					{navPage.name}
				</a>
			{/each}
		</nav>
	</div>

	<!-- Main -->
	<div class="main">
		{@render children()}
	</div>
</div>
