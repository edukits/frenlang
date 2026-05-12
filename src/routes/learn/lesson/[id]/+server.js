import { json } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function POST({ params, request, locals: { convex } }) {
	const body = await request.json();
	const result = await convex.mutation(api.learn.submitLessonResult, {
		lessonId: params.id,
		results: body.results ?? [],
		minutes: body.minutes ?? 5
	});
	return json(result);
}
