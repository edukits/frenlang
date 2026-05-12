import { api } from '$lib/server/convex.js';

export async function load({ locals: { convex } }) {
	const courses = await convex.query(api.content.courses.list);
	return { courses };
}
