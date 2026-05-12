import { api } from '$lib/server/convex.js';

export async function load({ locals: { convex } }) {
	const profile = await convex.mutation(api.profiles.ensureCurrent);
	const rewards = await convex.query(api.gamification.listRewards);
	return { profile, rewards };
}
