import { json } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function POST({ request, locals: { convex } }) {
	const body = await request.json();
	await convex.mutation(api.gamification.purchaseReward, { rewardId: body.rewardId });
	return json({ ok: true });
}
