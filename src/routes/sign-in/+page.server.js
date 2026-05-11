import { redirect } from '@sveltejs/kit';

export const load = async ({ url, locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();

	// If the user is already signed in, return them to the home page.
	if (session) {
		throw redirect(303, '/');
	}

	return { url: url.origin };
};
