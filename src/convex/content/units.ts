import { v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { requireAdmin, slugify } from '../shared';

const unitReturn = v.object({
	id: v.id('units'),
	courseId: v.id('courses'),
	slug: v.string(),
	name: v.string(),
	description: v.string(),
	order: v.number()
});

function serialize(unit: any) {
	return {
		id: unit._id,
		courseId: unit.courseId,
		slug: unit.slug,
		name: unit.name,
		description: unit.description,
		order: unit.order
	};
}

export const listByCourse = query({
	args: { courseId: v.id('courses') },
	returns: v.array(unitReturn),
	handler: async (ctx, args) => {
		const units = await ctx.db
			.query('units')
			.withIndex('by_course_and_order', (q) => q.eq('courseId', args.courseId))
			.take(200);
		return units.map(serialize);
	}
});

export const getByCourseAndSlug = query({
	args: { courseId: v.id('courses'), slug: v.string() },
	returns: v.union(v.null(), unitReturn),
	handler: async (ctx, args) => {
		const unit = await ctx.db
			.query('units')
			.withIndex('by_course_and_slug', (q: any) =>
				q.eq('courseId', args.courseId).eq('slug', args.slug)
			)
			.unique();
		return unit ? serialize(unit) : null;
	}
});

export const upsert = mutation({
	args: {
		id: v.optional(v.id('units')),
		courseId: v.id('courses'),
		slug: v.optional(v.string()),
		name: v.string(),
		description: v.string(),
		order: v.number()
	},
	returns: v.object({ id: v.id('units') }),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const slug = args.slug || slugify(args.name);
		if (args.id) {
			await ctx.db.patch(args.id, {
				courseId: args.courseId,
				slug,
				name: args.name,
				description: args.description,
				order: args.order
			});
			return { id: args.id };
		}

		const existing = await ctx.db
			.query('units')
			.withIndex('by_course_and_slug', (q: any) => q.eq('courseId', args.courseId).eq('slug', slug))
			.unique();
		if (existing) {
			await ctx.db.patch(existing._id, {
				name: args.name,
				description: args.description,
				order: args.order
			});
			return { id: existing._id };
		}

		const id = await ctx.db.insert('units', {
			courseId: args.courseId,
			slug,
			name: args.name,
			description: args.description,
			order: args.order
		});
		return { id };
	}
});
