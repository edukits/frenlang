import { error as kitError } from '@sveltejs/kit';

import { api } from '$lib/server/convex.js';

export const load = async ({ locals: { session, convex } }) => {
	if (!session) {
		return {
			session,
			dashboard: null,
			skillTree: null,
			nextLesson: null
		};
	}

	try {
		await convex.mutation(api.profiles.ensureCurrent);
		const day = new Date().toISOString().slice(0, 10);
		const [dashboard, skillTree] = await Promise.all([
			convex.query(api.gamification.getDashboard, { day }),
			convex.query(api.learn.getSkillTree, { courseSlug: 'french' })
		]);
		const nextLesson =
			skillTree?.units
				?.flatMap((unit) => unit.lessons.map((lesson) => ({ ...lesson, unitName: unit.name })))
				.find((lesson) => lesson.status === 'unlocked') ?? null;

		return {
			session,
			dashboard,
			skillTree,
			nextLesson
		};
	} catch (error) {
		console.error('Error loading dashboard:', error);
		kitError(500, 'Failed to load dashboard');
	}
};
