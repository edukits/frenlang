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
	const lesson = await convex.query(api.content.lessons.getByUnitAndSlug, {
		unitId: unit.id,
		slug: params.lesson
	});
	if (!lesson) {
		kitError(404, 'Lesson not found');
	}
	const items = await convex.query(api.content.items.listByLesson, { lessonId: lesson.id });
	return { course, unit, lesson, items };
}
