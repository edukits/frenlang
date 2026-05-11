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

function serializeVocabulary(item: any) {
	return {
		id: item._id,
		word_type: item.word_type,
		word: item.word,
		translation: item.translation,
		plural_form: item.plural_form,
		gender: item.gender,
		language_id: item.language_id ?? 1
	};
}

function serializeList(list: any, vocabulary: any[] = []) {
	return {
		id: list._id,
		name: list.name,
		description: list.description,
		user_id: list.userId,
		language_id: list.language_id ?? 1,
		created_at: new Date(list._creationTime).toISOString(),
		vocabulary
	};
}

async function assertOwnedList(ctx: any, listId: any, userId: any) {
	const list = await ctx.db.get(listId);
	if (!list || list.userId !== userId) {
		throw new ConvexError('List not found');
	}
	return list;
}

async function getVocabularyForList(ctx: any, listId: any) {
	const relationships = await ctx.db
		.query('vocabularyLists')
		.withIndex('by_list', (q: any) => q.eq('listId', listId))
		.collect();

	const vocabulary = await Promise.all(
		relationships.map((relationship: any) => ctx.db.get(relationship.vocabularyId))
	);
	return vocabulary.filter(Boolean).map(serializeVocabulary);
}

export const listForCurrentUser = query({
	args: {},
	returns: v.array(
		v.object({
			id: v.id('lists'),
			name: v.string(),
			description: v.string(),
			user_id: v.id('users'),
			language_id: v.number(),
			created_at: v.string(),
			vocabulary_count: v.number()
		})
	),
	handler: async (ctx) => {
		const userId = await requireUser(ctx);
		const lists = await ctx.db
			.query('lists')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();
		const sorted = [...lists].sort((a, b) => b._creationTime - a._creationTime);

		return await Promise.all(
			sorted.map(async (list) => {
				const relationships = await ctx.db
					.query('vocabularyLists')
					.withIndex('by_list', (q) => q.eq('listId', list._id))
					.collect();
				return {
					...serializeList(list),
					vocabulary_count: relationships.length
				};
			})
		);
	}
});

export const create = mutation({
	args: {
		name: v.string(),
		description: v.string()
	},
	returns: v.array(v.object({ id: v.id('lists') })),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const id = await ctx.db.insert('lists', {
			name: args.name,
			description: args.description,
			userId,
			language_id: 1
		});
		return [{ id }];
	}
});

export const get = query({
	args: {
		id: v.id('lists')
	},
	returns: v.union(
		v.null(),
		v.object({
			id: v.id('lists'),
			name: v.string(),
			description: v.string(),
			user_id: v.id('users'),
			language_id: v.number(),
			created_at: v.string(),
			vocabulary: v.array(
				v.object({
					id: v.id('vocabulary'),
					word_type: v.string(),
					word: v.string(),
					translation: v.string(),
					plural_form: v.optional(v.string()),
					gender: v.optional(v.string()),
					language_id: v.number()
				})
			)
		})
	),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const list = await ctx.db.get(args.id);
		if (!list || list.userId !== userId) {
			return null;
		}
		const vocabulary = await getVocabularyForList(ctx, list._id);
		return serializeList(list, vocabulary);
	}
});

export const update = mutation({
	args: {
		id: v.id('lists'),
		name: v.optional(v.string()),
		description: v.optional(v.string())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		await assertOwnedList(ctx, args.id, userId);

		const fields: Record<string, string> = {};
		if (args.name) fields.name = args.name;
		if (args.description) fields.description = args.description;
		if (Object.keys(fields).length === 0) {
			throw new ConvexError('Missing field(s) to update');
		}

		await ctx.db.patch(args.id, fields);
		return null;
	}
});

export const remove = mutation({
	args: {
		id: v.id('lists')
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		await assertOwnedList(ctx, args.id, userId);

		const relationships = await ctx.db
			.query('vocabularyLists')
			.withIndex('by_list', (q) => q.eq('listId', args.id))
			.collect();
		for (const relationship of relationships) {
			await ctx.db.delete(relationship._id);
		}

		await ctx.db.delete(args.id);
		return null;
	}
});

export const addVocabulary = mutation({
	args: {
		id: v.id('lists'),
		vocabularyIds: v.array(v.id('vocabulary'))
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		await assertOwnedList(ctx, args.id, userId);

		for (const vocabularyId of args.vocabularyIds) {
			const existing = await ctx.db
				.query('vocabularyLists')
				.withIndex('by_list_vocabulary', (q: any) =>
					q.eq('listId', args.id).eq('vocabularyId', vocabularyId)
				)
				.first();

			if (!existing) {
				await ctx.db.insert('vocabularyLists', {
					listId: args.id,
					vocabularyId
				});
			}
		}

		return null;
	}
});

export const removeVocabulary = mutation({
	args: {
		id: v.id('lists'),
		vocabularyIds: v.array(v.id('vocabulary'))
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		await assertOwnedList(ctx, args.id, userId);
		const vocabularyIds = new Set(args.vocabularyIds);
		const relationships = await ctx.db
			.query('vocabularyLists')
			.withIndex('by_list', (q) => q.eq('listId', args.id))
			.collect();

		for (const relationship of relationships) {
			if (vocabularyIds.has(relationship.vocabularyId)) {
				await ctx.db.delete(relationship._id);
			}
		}

		return null;
	}
});
