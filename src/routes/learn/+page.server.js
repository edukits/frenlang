import { api } from '$lib/server/convex.js';

export async function load({ locals: { convex } }) {
	const skillTree = await convex.query(api.learn.getSkillTree, { courseSlug: 'french' });
	return {
		skillTree
	};
}
