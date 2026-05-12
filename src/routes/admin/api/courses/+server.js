import { json } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function POST({ request, locals: { convex } }) {
	const body = await request.json();
	const result = await convex.mutation(api.content.courses.upsert, {
		slug: body.slug || undefined,
		name: body.name,
		description: body.description ?? '',
		language: body.language ?? 'fr',
		order: Number(body.order ?? 0)
	});
	return json(result);
}
