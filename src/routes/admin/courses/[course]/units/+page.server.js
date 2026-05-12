import { error as kitError } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function load({ params, locals: { convex } }) {
	const course = await convex.query(api.content.courses.getBySlug, { slug: params.course });
	if (!course) {
		kitError(404, 'Course not found');
	}
	const units = await convex.query(api.content.units.listByCourse, { courseId: course.id });
	return { course, units };
}
