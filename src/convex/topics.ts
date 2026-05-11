import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';

async function requireUser(ctx: any) {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new ConvexError('Not authenticated');
	}
	return userId;
}

function serializeTopic(topic: any) {
	return {
		id: topic._id,
		name: topic.name,
		description: topic.description ?? ''
	};
}

function sortTopics(topics: any[], orderBy: string, orderDir: string) {
	const field = ['name', 'description'].includes(orderBy) ? orderBy : '_creationTime';
	const direction = orderDir === 'desc' ? -1 : 1;

	return [...topics].sort((a, b) => {
		const aValue = a[field] ?? '';
		const bValue = b[field] ?? '';
		return String(aValue).localeCompare(String(bValue), 'en') * direction;
	});
}

export const count = query({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		await requireUser(ctx);
		const topics = await ctx.db.query('topics').collect();
		return topics.length;
	}
});

export const list = query({
	args: {
		page: v.number(),
		pageSize: v.number(),
		orderBy: v.string(),
		orderDir: v.string()
	},
	returns: v.object({
		topics: v.array(
			v.object({
				id: v.id('topics'),
				name: v.string(),
				description: v.string()
			})
		),
		topicSize: v.number()
	}),
	handler: async (ctx, args) => {
		await requireUser(ctx);
		const topics = await ctx.db.query('topics').collect();
		const sorted = sortTopics(topics, args.orderBy, args.orderDir);
		const offset = (args.page - 1) * args.pageSize;

		return {
			topics: sorted.slice(offset, offset + args.pageSize).map(serializeTopic),
			topicSize: topics.length
		};
	}
});

export const search = query({
	args: {
		search: v.string(),
		limit: v.number(),
		excludeIds: v.array(v.id('topics'))
	},
	returns: v.array(
		v.object({
			id: v.id('topics'),
			name: v.string(),
			description: v.string()
		})
	),
	handler: async (ctx, args) => {
		await requireUser(ctx);
		const search = args.search.trim().toLowerCase();
		const excluded = new Set(args.excludeIds);
		const topics = await ctx.db.query('topics').collect();

		return topics
			.filter((topic) => !excluded.has(topic._id))
			.filter((topic) => !search || topic.name.toLowerCase().includes(search))
			.slice(0, args.limit)
			.map(serializeTopic);
	}
});

export const update = mutation({
	args: {
		id: v.id('topics'),
		name: v.optional(v.string()),
		description: v.optional(v.string())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireUser(ctx);

		const fields: Record<string, string> = {};
		if (args.name) fields.name = args.name;
		if (args.description) fields.description = args.description;

		if (Object.keys(fields).length === 0) {
			throw new ConvexError('Must provide at least one field to update');
		}

		await ctx.db.patch(args.id, fields);
		return null;
	}
});

export const remove = mutation({
	args: {
		id: v.id('topics')
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireUser(ctx);

		const relationships = await ctx.db
			.query('vocabularyTopics')
			.withIndex('by_topic', (q) => q.eq('topicId', args.id))
			.collect();
		for (const relationship of relationships) {
			await ctx.db.delete(relationship._id);
		}

		await ctx.db.delete(args.id);
		return null;
	}
});
