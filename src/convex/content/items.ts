import { ConvexError, v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { requireAdmin } from '../shared';

const drillType = v.union(
	v.literal('fill_blank'),
	v.literal('translate'),
	v.literal('transform'),
	v.literal('multiple_choice')
);
const itemTable = v.union(v.literal('vocabulary'), v.literal('drillItems'));
const itemId = v.union(v.id('vocabulary'), v.id('drillItems'));

const drillReturn = v.object({
	id: v.id('drillItems'),
	prompt: v.string(),
	answer: v.string(),
	alternates: v.array(v.string()),
	type: drillType,
	choices: v.optional(v.array(v.string())),
	explanation: v.optional(v.string()),
	language: v.string()
});

function serializeDrill(item: any) {
	return {
		id: item._id,
		prompt: item.prompt,
		answer: item.answer,
		alternates: item.alternates,
		type: item.type,
		choices: item.choices,
		explanation: item.explanation,
		language: item.language
	};
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

async function loadItem(ctx: any, relationship: any) {
	const item = await ctx.db.get(relationship.itemId);
	if (!item) return null;
	return {
		id: relationship._id,
		lessonId: relationship.lessonId,
		itemId: relationship.itemId,
		itemTable: relationship.itemTable,
		order: relationship.order,
		item: relationship.itemTable === 'vocabulary' ? serializeVocabulary(item) : serializeDrill(item)
	};
}

export const listByLesson = query({
	args: { lessonId: v.id('lessons') },
	returns: v.array(v.any()),
	handler: async (ctx, args) => {
		const relationships = await ctx.db
			.query('lessonItems')
			.withIndex('by_lesson_and_order', (q) => q.eq('lessonId', args.lessonId))
			.take(500);
		const items = await Promise.all(
			relationships.map((relationship) => loadItem(ctx, relationship))
		);
		return items.filter(Boolean);
	}
});

export const createDrillItem = mutation({
	args: {
		prompt: v.string(),
		answer: v.string(),
		alternates: v.array(v.string()),
		type: drillType,
		choices: v.optional(v.array(v.string())),
		explanation: v.optional(v.string()),
		language: v.string()
	},
	returns: v.object({ id: v.id('drillItems') }),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const id = await ctx.db.insert('drillItems', args);
		return { id };
	}
});

export const updateDrillItem = mutation({
	args: {
		id: v.id('drillItems'),
		prompt: v.string(),
		answer: v.string(),
		alternates: v.array(v.string()),
		type: drillType,
		choices: v.optional(v.array(v.string())),
		explanation: v.optional(v.string()),
		language: v.string()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const { id, ...fields } = args;
		await ctx.db.patch(id, fields);
		return null;
	}
});

export const addToLesson = mutation({
	args: {
		lessonId: v.id('lessons'),
		itemTable,
		itemId,
		order: v.number()
	},
	returns: v.object({ id: v.id('lessonItems') }),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const item = await ctx.db.get(args.itemId);
		if (!item) {
			throw new ConvexError('Item not found');
		}
		const existing = await ctx.db
			.query('lessonItems')
			.withIndex('by_lesson_and_item', (q: any) =>
				q.eq('lessonId', args.lessonId).eq('itemTable', args.itemTable).eq('itemId', args.itemId)
			)
			.unique();
		if (existing) {
			await ctx.db.patch(existing._id, { order: args.order });
			return { id: existing._id };
		}

		const id = await ctx.db.insert('lessonItems', args);
		return { id };
	}
});

export const removeFromLesson = mutation({
	args: { id: v.id('lessonItems') },
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		await ctx.db.delete(args.id);
		return null;
	}
});

export const bulkCreateDrillsForLesson = mutation({
	args: {
		lessonId: v.id('lessons'),
		items: v.array(
			v.object({
				prompt: v.string(),
				answer: v.string(),
				alternates: v.optional(v.array(v.string())),
				type: drillType,
				choices: v.optional(v.array(v.string())),
				explanation: v.optional(v.string()),
				language: v.optional(v.string())
			})
		)
	},
	returns: v.object({ count: v.number() }),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		let order = 0;
		const existing = await ctx.db
			.query('lessonItems')
			.withIndex('by_lesson_and_order', (q) => q.eq('lessonId', args.lessonId))
			.order('desc')
			.first();
		if (existing) order = existing.order + 1;

		for (const item of args.items) {
			const id = await ctx.db.insert('drillItems', {
				prompt: item.prompt,
				answer: item.answer,
				alternates: item.alternates ?? [],
				type: item.type,
				choices: item.choices,
				explanation: item.explanation,
				language: item.language ?? 'fr'
			});
			await ctx.db.insert('lessonItems', {
				lessonId: args.lessonId,
				itemTable: 'drillItems',
				itemId: id,
				order
			});
			order += 1;
		}

		return { count: args.items.length };
	}
});
