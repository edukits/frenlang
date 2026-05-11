import { error as kitError } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export const load = async ({ locals: { session, convex } }) => {
	if (!session) {
		return {
			lists: []
		};
	}

	try {
		const lists = await convex.query(api.lists.listForCurrentUser);
		return {
			session,
			lists
		};
	} catch (error) {
		console.error('Error loading lists:', error);
		kitError(500, 'Failed to load lists');
	}
};
