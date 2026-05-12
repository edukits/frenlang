import { v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { requireAdmin, slugify } from '../shared';

const courseReturn = v.object({
	id: v.id('courses'),
	slug: v.string(),
	name: v.string(),
	description: v.string(),
	language: v.string(),
	order: v.number()
});

function serialize(course: any) {
	return {
		id: course._id,
		slug: course.slug,
		name: course.name,
		description: course.description,
		language: course.language,
		order: course.order
	};
}

export const list = query({
	args: {},
	returns: v.array(courseReturn),
	handler: async (ctx) => {
		const courses = await ctx.db.query('courses').take(200);
		return courses.sort((a, b) => a.order - b.order).map(serialize);
	}
});

export const getBySlug = query({
	args: { slug: v.string() },
	returns: v.union(v.null(), courseReturn),
	handler: async (ctx, args) => {
		const course = await ctx.db
			.query('courses')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.unique();
		return course ? serialize(course) : null;
	}
});

export const upsert = mutation({
	args: {
		id: v.optional(v.id('courses')),
		slug: v.optional(v.string()),
		name: v.string(),
		description: v.string(),
		language: v.string(),
		order: v.number()
	},
	returns: v.object({ id: v.id('courses') }),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const slug = args.slug || slugify(args.name);
		if (args.id) {
			await ctx.db.patch(args.id, {
				slug,
				name: args.name,
				description: args.description,
				language: args.language,
				order: args.order
			});
			return { id: args.id };
		}

		const existing = await ctx.db
			.query('courses')
			.withIndex('by_slug', (q) => q.eq('slug', slug))
			.unique();
		if (existing) {
			await ctx.db.patch(existing._id, {
				name: args.name,
				description: args.description,
				language: args.language,
				order: args.order
			});
			return { id: existing._id };
		}

		const id = await ctx.db.insert('courses', {
			slug,
			name: args.name,
			description: args.description,
			language: args.language,
			order: args.order
		});
		return { id };
	}
});
