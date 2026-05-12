import { v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { requireAdmin, slugify } from '../shared';

const lessonKind = v.union(v.literal('vocabulary'), v.literal('grammar'), v.literal('mixed'));

const lessonReturn = v.object({
	id: v.id('lessons'),
	unitId: v.id('units'),
	slug: v.string(),
	name: v.string(),
	description: v.string(),
	order: v.number(),
	kind: lessonKind,
	xpReward: v.number()
});

function serialize(lesson: any) {
	return {
		id: lesson._id,
		unitId: lesson.unitId,
		slug: lesson.slug,
		name: lesson.name,
		description: lesson.description,
		order: lesson.order,
		kind: lesson.kind,
		xpReward: lesson.xpReward
	};
}

export const listByUnit = query({
	args: { unitId: v.id('units') },
	returns: v.array(lessonReturn),
	handler: async (ctx, args) => {
		const lessons = await ctx.db
			.query('lessons')
			.withIndex('by_unit_and_order', (q) => q.eq('unitId', args.unitId))
			.take(200);
		return lessons.map(serialize);
	}
});

export const get = query({
	args: { id: v.id('lessons') },
	returns: v.union(v.null(), lessonReturn),
	handler: async (ctx, args) => {
		const lesson = await ctx.db.get(args.id);
		return lesson ? serialize(lesson) : null;
	}
});

export const getByUnitAndSlug = query({
	args: { unitId: v.id('units'), slug: v.string() },
	returns: v.union(v.null(), lessonReturn),
	handler: async (ctx, args) => {
		const lesson = await ctx.db
			.query('lessons')
			.withIndex('by_unit_and_slug', (q: any) => q.eq('unitId', args.unitId).eq('slug', args.slug))
			.unique();
		return lesson ? serialize(lesson) : null;
	}
});

export const upsert = mutation({
	args: {
		id: v.optional(v.id('lessons')),
		unitId: v.id('units'),
		slug: v.optional(v.string()),
		name: v.string(),
		description: v.string(),
		order: v.number(),
		kind: lessonKind,
		xpReward: v.number()
	},
	returns: v.object({ id: v.id('lessons') }),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const slug = args.slug || slugify(args.name);
		if (args.id) {
			await ctx.db.patch(args.id, {
				unitId: args.unitId,
				slug,
				name: args.name,
				description: args.description,
				order: args.order,
				kind: args.kind,
				xpReward: args.xpReward
			});
			return { id: args.id };
		}

		const existing = await ctx.db
			.query('lessons')
			.withIndex('by_unit_and_slug', (q: any) => q.eq('unitId', args.unitId).eq('slug', slug))
			.unique();
		if (existing) {
			await ctx.db.patch(existing._id, {
				name: args.name,
				description: args.description,
				order: args.order,
				kind: args.kind,
				xpReward: args.xpReward
			});
			return { id: existing._id };
		}

		const id = await ctx.db.insert('lessons', {
			unitId: args.unitId,
			slug,
			name: args.name,
			description: args.description,
			order: args.order,
			kind: args.kind,
			xpReward: args.xpReward
		});
		return { id };
	}
});
