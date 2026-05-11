import { error } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export const load = async ({ locals: { convex }, params: { id } }) => {
	const list = await convex.query(api.lists.get, { id });

	if (!list) {
		error(404, 'List entry not found');
	}

	return { list };
};
