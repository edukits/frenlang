import { json } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function POST({ request, locals: { convex } }) {
	const body = await request.json();
	await convex.mutation(api.srs.submitReview, {
		itemTable: body.itemTable,
		itemId: body.itemId,
		quality: body.quality
	});
	return json({ ok: true });
}
