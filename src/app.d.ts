/// <reference types="unplugin-icons/types/svelte5" />

import type { ConvexHttpClient } from 'convex/browser';

type AppSession = {
	userId: string;
};

type AppUser = {
	id: string;
	email?: string;
	name?: string;
	image?: string;
};

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			convex: ConvexHttpClient;
			getSession: () => Promise<{ session: AppSession | null; user: AppUser | null }>;
			safeGetSession: () => Promise<{ session: AppSession | null; user: AppUser | null }>;
			session: AppSession | null;
			user: AppUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
