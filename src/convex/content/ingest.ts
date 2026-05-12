import { v } from 'convex/values';
import { internalMutationGeneric as internalMutation } from 'convex/server';
import { slugify } from '../shared';

const ingestItem = v.object({
	prompt: v.string(),
	answer: v.string(),
	alternates: v.optional(v.array(v.string())),
	type: v.union(
		v.literal('fill_blank'),
		v.literal('translate'),
		v.literal('transform'),
		v.literal('multiple_choice')
	),
	choices: v.optional(v.array(v.string())),
	explanation: v.optional(v.string()),
	language: v.optional(v.string())
});

async function upsertCourse(ctx: any, course: any) {
	const slug = course.slug || slugify(course.name);
	const existing = await ctx.db
		.query('courses')
		.withIndex('by_slug', (q: any) => q.eq('slug', slug))
		.unique();
	const fields = {
		slug,
		name: course.name,
		description: course.description ?? '',
		language: course.language ?? 'fr',
		order: course.order ?? 0
	};
	if (existing) {
		await ctx.db.patch(existing._id, fields);
		return existing._id;
	}
	return await ctx.db.insert('courses', fields);
}

async function upsertUnit(ctx: any, courseId: any, unit: any, order: number) {
	const slug = unit.slug || slugify(unit.name);
	const existing = await ctx.db
		.query('units')
		.withIndex('by_course_and_slug', (q: any) => q.eq('courseId', courseId).eq('slug', slug))
		.unique();
	const fields = {
		courseId,
		slug,
		name: unit.name,
		description: unit.description ?? '',
		order: unit.order ?? order
	};
	if (existing) {
		await ctx.db.patch(existing._id, fields);
		return existing._id;
	}
	return await ctx.db.insert('units', fields);
}

async function upsertLesson(ctx: any, unitId: any, lesson: any, order: number) {
	const slug = lesson.slug || slugify(lesson.name);
	const existing = await ctx.db
		.query('lessons')
		.withIndex('by_unit_and_slug', (q: any) => q.eq('unitId', unitId).eq('slug', slug))
		.unique();
	const fields = {
		unitId,
		slug,
		name: lesson.name,
		description: lesson.description ?? '',
		order: lesson.order ?? order,
		kind: lesson.kind ?? 'mixed',
		xpReward: lesson.xpReward ?? 20
	};
	if (existing) {
		await ctx.db.patch(existing._id, fields);
		return existing._id;
	}
	return await ctx.db.insert('lessons', fields);
}

export const bulkUpsert = internalMutation({
	args: {
		course: v.object({
			slug: v.optional(v.string()),
			name: v.string(),
			description: v.optional(v.string()),
			language: v.optional(v.string()),
			order: v.optional(v.number())
		}),
		units: v.array(
			v.object({
				slug: v.optional(v.string()),
				name: v.string(),
				description: v.optional(v.string()),
				order: v.optional(v.number()),
				lessons: v.array(
					v.object({
						slug: v.optional(v.string()),
						name: v.string(),
						description: v.optional(v.string()),
						order: v.optional(v.number()),
						kind: v.optional(
							v.union(v.literal('vocabulary'), v.literal('grammar'), v.literal('mixed'))
						),
						xpReward: v.optional(v.number()),
						items: v.array(ingestItem)
					})
				)
			})
		)
	},
	returns: v.object({
		courses: v.number(),
		units: v.number(),
		lessons: v.number(),
		items: v.number()
	}),
	handler: async (ctx, args) => {
		const courseId = await upsertCourse(ctx, args.course);
		let unitCount = 0;
		let lessonCount = 0;
		let itemCount = 0;

		for (let unitIndex = 0; unitIndex < args.units.length; unitIndex += 1) {
			const unit = args.units[unitIndex];
			const unitId = await upsertUnit(ctx, courseId, unit, unitIndex);
			unitCount += 1;

			for (let lessonIndex = 0; lessonIndex < unit.lessons.length; lessonIndex += 1) {
				const lesson = unit.lessons[lessonIndex];
				const lessonId = await upsertLesson(ctx, unitId, lesson, lessonIndex);
				lessonCount += 1;

				const existingItems = await ctx.db
					.query('lessonItems')
					.withIndex('by_lesson_and_order', (q: any) => q.eq('lessonId', lessonId))
					.take(500);
				for (const relationship of existingItems) {
					if (relationship.itemTable === 'drillItems') {
						await ctx.db.delete(relationship.itemId);
					}
					await ctx.db.delete(relationship._id);
				}

				for (let itemIndex = 0; itemIndex < lesson.items.length; itemIndex += 1) {
					const item = lesson.items[itemIndex];
					const drillId = await ctx.db.insert('drillItems', {
						prompt: item.prompt,
						answer: item.answer,
						alternates: item.alternates ?? [],
						type: item.type,
						choices: item.choices,
						explanation: item.explanation,
						language: item.language ?? args.course.language ?? 'fr'
					});
					await ctx.db.insert('lessonItems', {
						lessonId,
						itemTable: 'drillItems',
						itemId: drillId,
						order: itemIndex
					});
					itemCount += 1;
				}
			}
		}

		return { courses: 1, units: unitCount, lessons: lessonCount, items: itemCount };
	}
});
