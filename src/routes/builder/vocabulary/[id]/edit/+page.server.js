import { error } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export const load = async ({ locals: { convex }, params: { id } }) => {
	const item = await convex.query(api.vocabulary.get, { id });

	if (!item) {
		error(404, 'Vocabulary entry not found');
	}

	return { item };
};
