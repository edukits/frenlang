import { api } from '$lib/server/convex.js';

export async function load({ locals: { convex } }) {
	const profile = await convex.mutation(api.profiles.ensureCurrent);
	const day = new Date().toISOString().slice(0, 10);
	const dashboard = await convex.query(api.gamification.getDashboard, { day });
	return { profile, dashboard };
}
