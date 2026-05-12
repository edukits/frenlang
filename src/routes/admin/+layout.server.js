import { error as kitError } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function load({ locals: { convex } }) {
	const profile = await convex.mutation(api.profiles.ensureCurrent);
	if (!profile.isAdmin) {
		kitError(403, 'Admin access required');
	}
	const courses = await convex.query(api.content.courses.list);
	return { profile, courses };
}
