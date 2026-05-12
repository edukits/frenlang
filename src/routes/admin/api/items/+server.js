import { json } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function POST({ request, locals: { convex } }) {
	const body = await request.json();
	const items = (body.items ?? []).map((item) => ({
		prompt: item.prompt,
		answer: item.answer,
		alternates: item.alternates ?? [],
		type: item.type ?? 'translate',
		choices: item.choices,
		explanation: item.explanation,
		language: item.language ?? 'fr'
	}));
	const result = await convex.mutation(api.content.items.bulkCreateDrillsForLesson, {
		lessonId: body.lessonId,
		items
	});
	return json(result);
}
