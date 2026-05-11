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

<div class="flex min-h-screen flex-col">
	<header class="border-b px-4">
		<div class="container mx-auto flex items-center justify-between">
			<a href="/" class="flex items-center gap-1 text-xl font-semibold">
				<img src={Logo} alt="EduKits French" class="inline-block h-8 w-8" />
				Frenlang <span class="mt-1 hidden text-sm text-gray-500 md:block">By EduKits</span>
			</a>
			<nav class="flex items-center gap-3">
				{#if user}
					{#each menuItems as { href, icon: Icon, text } (href)}
						<a
							{href}
							class="mr-4 flex items-center gap-2 border-b-2 py-4 {isCurrentPage(href)
								? isSubPage(href)
									? 'border-slate-700'
									: 'border-sky-500 font-semibold text-sky-900'
								: 'border-transparent'}"
						>
							<Icon />
							<span class="hidden md:inline">{text}</span>
						</a>
					{/each}
					<button use:melt={$trigger} class="mr-4 flex items-center gap-2">
						<img src={svg} alt="Avatar" class="inline-block h-7 w-7 rounded-full" />
						<span class="hidden md:inline">My Account</span>
					</button>
					{#if $open}
						<div
							use:melt={$menu}
							transition:fly={{ duration: 150, y: -10 }}
							class="z-10 flex min-w-40 flex-col rounded-md border border-gray-200 bg-white p-1 shadow-lg"
						>
							<div use:melt={$item}>
								<a href="/profile" class="block rounded px-2 py-1 hover:bg-slate-200">Profile</a>
							</div>
							<div use:melt={$item}>
								<a href="/sign-out" class="block rounded px-2 py-1 hover:bg-slate-200">Sign Out</a>
							</div>
						</div>
					{/if}
				{:else}
					<a href="/sign-in">Sign In</a>
				{/if}
			</nav>
		</div>
	</header>
	<div class="p-4">
		<main class="container mx-auto flex-auto">
			{@render children()}
		</main>
	</div>
	<footer class="mt-auto border-t py-4">
		<div class="container mx-auto text-center text-xs text-slate-500">
			<p>
				&copy; Copyright {new Date().getFullYear()}
				<a href="https://edukits.co/" class="text-sky-600 hover:underline">EduKits International</a
				>. All rights reserved.
			</p>
		</div>
	</footer>
</div>

<Toaster />
