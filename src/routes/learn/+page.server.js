import { api } from '$lib/server/convex.js';

export async function load({ locals: { convex } }) {
	const vocabulary = await convex.query(api.vocabulary.all);
	return {
		vocabulary
	};
}
