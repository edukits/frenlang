import { error as kitError } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function load({ params, locals: { convex } }) {
	try {
		const session = await convex.query(api.learn.startLesson, { lessonId: params.id });
		return { session };
	} catch (error) {
		console.error('Error loading lesson:', error);
		kitError(404, 'Lesson not found');
	}
}
