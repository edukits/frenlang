<script>
	import '../app.css';
	import { page } from '$app/state';
	import { createAvatar } from '@dicebear/core';
	import { shapes } from '@dicebear/collection';
	import Logo from '../img/Logomark.png';
	import Toaster from '$lib/components/Toaster.svelte';
	import Handyman from '~icons/material-symbols/handyman-outline';
	import Library from '~icons/material-symbols/local-library-outline';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';

	let { data, children } = $props();
	let { user } = $derived(data);

	let svg = $derived(
		createAvatar(shapes, {
			seed: user?.email
		}).toDataUri()
	);

	const {
		elements: { menu, item, trigger },
		states: { open }
	} = createDropdownMenu();

	const menuItems = [
		{ href: '/builder', icon: Handyman, text: 'Builder' },
		{ href: '/learn', icon: Library, text: 'Learn' }
	];

	/** @param {string} href */
	const isCurrentPage = (href) => page.url.pathname.startsWith(href);
	/** @param {string} href */
	const isSubPage = (href) => page.url.pathname.startsWith(href) && page.url.pathname !== href;
</script>

<div class="flex min-h-screen flex-col bg-white">
	<header class="border-b border-[var(--cloud-soft)] px-4">
		<div class="container mx-auto flex items-center justify-between">
			<a href="/" class="brand-wordmark flex items-center gap-2 py-3 text-xl">
				<img src={Logo} alt="EduKits French" class="inline-block h-8 w-8" />
				Frenlang <span class="mt-1 hidden text-sm text-[var(--silver)] md:block">By EduKits</span>
			</a>
			<nav class="flex items-center gap-3">
				{#if user}
					{#each menuItems as { href, icon: Icon, text } (href)}
						<a
							{href}
							class="top-nav-link mr-4 flex items-center gap-2 py-4 {isCurrentPage(href)
								? isSubPage(href)
									? 'top-nav-link--subpage'
									: 'top-nav-link--active'
								: ''}"
						>
							<Icon />
							<span class="hidden md:inline">{text}</span>
						</a>
					{/each}
					<button
						use:melt={$trigger}
						class="mr-4 flex items-center gap-2 font-extrabold text-[var(--graphite)]"
					>
						<img src={svg} alt="Avatar" class="inline-block h-7 w-7 rounded-full" />
						<span class="hidden md:inline">My Account</span>
					</button>
					{#if $open}
						<div
							use:melt={$menu}
							transition:fly={{ duration: 150, y: -10 }}
							class="account-menu z-10 flex min-w-40 flex-col p-1"
						>
							<div use:melt={$item}>
								<a href="/profile" class="block px-3 py-2">Profile</a>
							</div>
							<div use:melt={$item}>
								<a href="/sign-out" class="block px-3 py-2">Sign Out</a>
							</div>
						</div>
					{/if}
				{:else}
					<a href="/sign-in" class="text-link">Sign In</a>
				{/if}
			</nav>
		</div>
	</header>
	<div class="flex min-h-0 flex-1 flex-col p-4 md:p-6">
		<main class="container mx-auto flex min-h-0 flex-1 flex-col">
			{@render children()}
		</main>
	</div>
	<footer class="mt-auto border-t border-[var(--cloud-soft)] py-4">
		<div class="container mx-auto text-center text-xs font-bold text-[var(--silver)]">
			<p>
				&copy; Copyright {new Date().getFullYear()}
				<a href="https://edukits.co/" class="text-link">EduKits International</a>. All rights
				reserved.
			</p>
		</div>
	</footer>
</div>

<Toaster />
