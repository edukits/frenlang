import { json } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function POST({ request, locals: { convex } }) {
	const body = await request.json();
	const result = await convex.mutation(api.content.units.upsert, {
		courseId: body.courseId,
		slug: body.slug || undefined,
		name: body.name,
		description: body.description ?? '',
		order: Number(body.order ?? 0)
	});
	return json(result);
}
