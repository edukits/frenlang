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

function serializeVocabulary(item: any, topics: any[] = []) {
	return {
		id: item._id,
		word_type: item.word_type,
		word: item.word,
		translation: item.translation,
		plural_form: item.plural_form,
		gender: item.gender,
		language_id: item.language_id ?? 1,
		topics
	};
}

async function getTopicsForVocabulary(ctx: any, vocabularyId: any) {
	const relationships = await ctx.db
		.query('vocabularyTopics')
		.withIndex('by_vocabulary', (q: any) => q.eq('vocabularyId', vocabularyId))
		.collect();

	const topics = await Promise.all(
		relationships.map((relationship: any) => ctx.db.get(relationship.topicId))
	);
	return topics.filter(Boolean).map(serializeTopic);
}

async function replaceTopics(ctx: any, vocabularyId: any, topicIds: any[]) {
	const currentRelationships = await ctx.db
		.query('vocabularyTopics')
		.withIndex('by_vocabulary', (q: any) => q.eq('vocabularyId', vocabularyId))
		.collect();
	const currentTopicIds = new Set(currentRelationships.map((rel: any) => rel.topicId));
	const nextTopicIds = new Set(topicIds);

	for (const topicId of nextTopicIds) {
		if (!currentTopicIds.has(topicId)) {
			await ctx.db.insert('vocabularyTopics', { vocabularyId, topicId });
		}
	}

	for (const relationship of currentRelationships) {
		if (!nextTopicIds.has(relationship.topicId)) {
			await ctx.db.delete(relationship._id);
		}
	}
}

function sortVocabulary(items: any[], orderBy: string, orderDir: string) {
	const field = ['word', 'translation', 'word_type', 'gender', 'plural_form'].includes(orderBy)
		? orderBy
		: '_creationTime';
	const direction = orderDir === 'desc' ? -1 : 1;

	return [...items].sort((a, b) => {
		const aValue = a[field] ?? '';
		const bValue = b[field] ?? '';
		return String(aValue).localeCompare(String(bValue), 'fr') * direction;
	});
}

export const count = query({
	args: {},
	returns: v.number(),
	handler: async (ctx) => {
		await requireUser(ctx);
		const vocabulary = await ctx.db.query('vocabulary').collect();
		return vocabulary.length;
	}
});

export const all = query({
	args: {},
	returns: v.array(
		v.object({
			id: v.id('vocabulary'),
			word_type: v.string(),
			word: v.string(),
			translation: v.string(),
			plural_form: v.optional(v.string()),
			gender: v.optional(v.string()),
			language_id: v.number(),
			topics: v.array(v.any())
		})
	),
	handler: async (ctx) => {
		const vocabulary = await ctx.db.query('vocabulary').collect();
		return sortVocabulary(vocabulary, 'word', 'asc').map((item) => serializeVocabulary(item));
	}
});

export const list = query({
	args: {
		page: v.number(),
		pageSize: v.number(),
		orderBy: v.string(),
		orderDir: v.string(),
		wordType: v.string()
	},
	returns: v.object({
		vocabulary: v.array(
			v.object({
				id: v.id('vocabulary'),
				word_type: v.string(),
				word: v.string(),
				translation: v.string(),
				plural_form: v.optional(v.string()),
				gender: v.optional(v.string()),
				language_id: v.number(),
				topics: v.array(
					v.object({
						id: v.id('topics'),
						name: v.string(),
						description: v.string()
					})
				)
			})
		),
		vocabSize: v.number()
	}),
	handler: async (ctx, args) => {
		await requireUser(ctx);
		const allVocabulary = args.wordType
			? await ctx.db
					.query('vocabulary')
					.withIndex('by_word_type', (q) => q.eq('word_type', args.wordType))
					.collect()
			: await ctx.db.query('vocabulary').collect();
		const sorted = sortVocabulary(allVocabulary, args.orderBy, args.orderDir);
		const offset = (args.page - 1) * args.pageSize;
		const page = sorted.slice(offset, offset + args.pageSize);

		return {
			vocabulary: await Promise.all(
				page.map(async (item) =>
					serializeVocabulary(item, await getTopicsForVocabulary(ctx, item._id))
				)
			),
			vocabSize: allVocabulary.length
		};
	}
});

export const get = query({
	args: {
		id: v.id('vocabulary')
	},
	returns: v.union(
		v.null(),
		v.object({
			id: v.id('vocabulary'),
			word_type: v.string(),
			word: v.string(),
			translation: v.string(),
			plural_form: v.optional(v.string()),
			gender: v.optional(v.string()),
			language_id: v.number(),
			topics: v.array(
				v.object({
					id: v.id('topics'),
					name: v.string(),
					description: v.string()
				})
			)
		})
	),
	handler: async (ctx, args) => {
		await requireUser(ctx);
		const item = await ctx.db.get(args.id);
		if (!item) {
			return null;
		}

		return serializeVocabulary(item, await getTopicsForVocabulary(ctx, item._id));
	}
});

export const search = query({
	args: {
		search: v.string(),
		limit: v.number(),
		excludeIds: v.array(v.id('vocabulary'))
	},
	returns: v.array(
		v.object({
			id: v.id('vocabulary'),
			word: v.string(),
			translation: v.string(),
			word_type: v.string()
		})
	),
	handler: async (ctx, args) => {
		await requireUser(ctx);
		const search = args.search.trim().toLowerCase();
		const excluded = new Set(args.excludeIds);
		const vocabulary = await ctx.db.query('vocabulary').collect();

		return vocabulary
			.filter((item) => !excluded.has(item._id))
			.filter((item) => !search || item.word.toLowerCase().includes(search))
			.slice(0, args.limit)
			.map((item) => ({
				id: item._id,
				word: item.word,
				translation: item.translation,
				word_type: item.word_type
			}));
	}
});

export const create = mutation({
	args: {
		word_type: v.string(),
		word: v.string(),
		translation: v.string(),
		plural_form: v.optional(v.string()),
		gender: v.optional(v.string()),
		topicIds: v.array(v.id('topics'))
	},
	returns: v.array(v.object({ id: v.id('vocabulary') })),
	handler: async (ctx, args) => {
		await requireUser(ctx);
		const existing = await ctx.db
			.query('vocabulary')
			.withIndex('by_word_type_word', (q: any) =>
				q.eq('word_type', args.word_type).eq('word', args.word)
			)
			.first();

		if (existing) {
			throw new ConvexError(`Word "${args.word}" already exists as a ${args.word_type}`);
		}

		const fields: any = {
			word_type: args.word_type,
			word: args.word,
			translation: args.translation,
			language_id: 1
		};
		if (args.plural_form) fields.plural_form = args.plural_form;
		if (args.gender) fields.gender = args.gender;

		const id = await ctx.db.insert('vocabulary', fields);
		await replaceTopics(ctx, id, args.topicIds);
		return [{ id }];
	}
});

export const update = mutation({
	args: {
		id: v.id('vocabulary'),
		word_type: v.optional(v.string()),
		word: v.optional(v.string()),
		translation: v.optional(v.string()),
		plural_form: v.optional(v.string()),
		gender: v.optional(v.string()),
		topicIds: v.array(v.id('topics'))
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireUser(ctx);

		const fields: any = {};
		if (args.word_type) fields.word_type = args.word_type;
		if (args.word) fields.word = args.word;
		if (args.translation) fields.translation = args.translation;
		if (args.plural_form) fields.plural_form = args.plural_form;
		if (args.gender) fields.gender = args.gender;

		if (Object.keys(fields).length > 0) {
			await ctx.db.patch(args.id, fields);
		}
		await replaceTopics(ctx, args.id, args.topicIds);
		return null;
	}
});

export const remove = mutation({
	args: {
		id: v.id('vocabulary')
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireUser(ctx);
		const topicRelationships = await ctx.db
			.query('vocabularyTopics')
			.withIndex('by_vocabulary', (q) => q.eq('vocabularyId', args.id))
			.collect();
		for (const relationship of topicRelationships) {
			await ctx.db.delete(relationship._id);
		}

		const listRelationships = await ctx.db
			.query('vocabularyLists')
			.withIndex('by_vocabulary', (q) => q.eq('vocabularyId', args.id))
			.collect();
		for (const relationship of listRelationships) {
			await ctx.db.delete(relationship._id);
		}

		await ctx.db.delete(args.id);
		return null;
	}
});
