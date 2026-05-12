import { error as kitError } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export async function load({ params, locals: { convex } }) {
	const course = await convex.query(api.content.courses.getBySlug, { slug: params.course });
	if (!course) {
		kitError(404, 'Course not found');
	}
	const unit = await convex.query(api.content.units.getByCourseAndSlug, {
		courseId: course.id,
		slug: params.unit
	});
	if (!unit) {
		kitError(404, 'Unit not found');
	}
	const lessons = await convex.query(api.content.lessons.listByUnit, { unitId: unit.id });
	return { course, unit, lessons };
}
