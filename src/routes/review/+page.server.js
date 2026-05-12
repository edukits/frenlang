import { api } from '$lib/server/convex.js';

export async function load({ locals: { convex } }) {
	const reviews = await convex.query(api.srs.dueReviews, { limit: 20, now: Date.now() });
	return { reviews };
}
