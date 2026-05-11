import { redirect } from '@sveltejs/kit';

import { api, clearAuthCookies } from '$lib/server/convex.js';

export const GET = async ({ url, locals: { convex }, cookies }) => {
	const redirectTo = url.searchParams.get('next') ?? '/';

	try {
		await convex.action(api.auth.signOut);
	} catch (_error) {
		// The local cookies still need to be cleared if the remote session is already gone.
	}

	clearAuthCookies(cookies);
	throw redirect(303, redirectTo);
};
