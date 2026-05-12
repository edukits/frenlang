import { v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { requireUser } from './shared';

const itemTable = v.union(v.literal('vocabulary'), v.literal('drillItems'));
const itemId = v.union(v.id('vocabulary'), v.id('drillItems'));

function nextReview(review: any, quality: number) {
	const normalized = Math.max(0, Math.min(5, quality));
	const reps = (review?.reps ?? 0) + 1;
	let ease = review?.ease ?? 2.5;
	let intervalDays = review?.intervalDays ?? 0;
	let lapses = review?.lapses ?? 0;

	if (normalized < 3) {
		lapses += 1;
		intervalDays = 1;
	} else {
		ease = Math.max(1.3, ease + (0.1 - (5 - normalized) * (0.08 + (5 - normalized) * 0.02)));
		intervalDays = reps === 1 ? 1 : reps === 2 ? 3 : Math.ceil(intervalDays * ease);
	}

	return {
		ease,
		intervalDays,
		lapses,
		reps,
		dueAt: Date.now() + intervalDays * 24 * 60 * 60 * 1000
	};
}

function serializeVocabulary(item: any) {
	return {
		id: item._id,
		prompt: item.word,
		answer: item.translation,
		type: 'vocabulary'
	};
}

function serializeDrill(item: any) {
	return {
		id: item._id,
		prompt: item.prompt,
		answer: item.answer,
		type: item.type,
		explanation: item.explanation
	};
}

export const dueReviews = query({
	args: { limit: v.number(), now: v.number() },
	returns: v.array(v.any()),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const due = await ctx.db
			.query('userItemReviews')
			.withIndex('by_user_and_dueAt', (q: any) => q.eq('userId', userId).lte('dueAt', args.now))
			.take(Math.min(args.limit, 100));

		const items = await Promise.all(
			due.map(async (review) => {
				const item = await ctx.db.get(review.itemId);
				if (!item) return null;
				return {
					reviewId: review._id,
					itemTable: review.itemTable,
					itemId: review.itemId,
					ease: review.ease,
					intervalDays: review.intervalDays,
					lapses: review.lapses,
					reps: review.reps,
					item: review.itemTable === 'vocabulary' ? serializeVocabulary(item) : serializeDrill(item)
				};
			})
		);
		return items.filter(Boolean);
	}
});

export const submitReview = mutation({
	args: {
		itemTable,
		itemId,
		quality: v.number()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const existing = await ctx.db
			.query('userItemReviews')
			.withIndex('by_user_and_item', (q: any) =>
				q.eq('userId', userId).eq('itemTable', args.itemTable).eq('itemId', args.itemId)
			)
			.unique();
		const fields = nextReview(existing, args.quality);
		if (existing) {
			await ctx.db.patch(existing._id, fields);
		} else {
			await ctx.db.insert('userItemReviews', {
				userId,
				itemTable: args.itemTable,
				itemId: args.itemId,
				...fields
			});
		}
		return null;
	}
});
