import { ConvexError, v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import {
	dayKey,
	getOrCreateProfile,
	normalizeAnswer,
	previousDayKey,
	requireUser,
	tierForXp
} from './shared';

const resultValidator = v.object({
	itemTable: v.union(v.literal('vocabulary'), v.literal('drillItems')),
	itemId: v.union(v.id('vocabulary'), v.id('drillItems')),
	correct: v.boolean(),
	quality: v.number()
});

function serializeVocabulary(item: any) {
	return {
		id: item._id,
		prompt: item.word,
		answer: item.translation,
		word: item.word,
		translation: item.translation,
		type: 'vocabulary',
		choices: []
	};
}

function serializeDrill(item: any) {
	return {
		id: item._id,
		prompt: item.prompt,
		answer: item.answer,
		alternates: item.alternates,
		type: item.type,
		choices: item.choices ?? [],
		explanation: item.explanation
	};
}

function exerciseTypesFor(itemTable: string, item: any) {
	if (itemTable === 'vocabulary') {
		return ['flashcard', 'multiple_choice', 'typing'];
	}
	if (item.type === 'fill_blank') {
		return ['fill_blank', 'multiple_choice'];
	}
	if (item.type === 'multiple_choice') {
		return ['multiple_choice', 'typing'];
	}
	return ['typing', 'multiple_choice'];
}

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
		intervalDays = reps === 1 ? 1 : reps === 2 ? 3 : Math.ceil(Math.max(1, intervalDays) * ease);
	}

	return {
		ease,
		intervalDays,
		lapses,
		reps,
		dueAt: Date.now() + intervalDays * 24 * 60 * 60 * 1000
	};
}

async function upsertReview(ctx: any, userId: any, result: any) {
	const existing = await ctx.db
		.query('userItemReviews')
		.withIndex('by_user_and_item', (q: any) =>
			q.eq('userId', userId).eq('itemTable', result.itemTable).eq('itemId', result.itemId)
		)
		.unique();
	const fields = nextReview(existing, result.quality);
	if (existing) {
		await ctx.db.patch(existing._id, fields);
	} else {
		await ctx.db.insert('userItemReviews', {
			userId,
			itemTable: result.itemTable,
			itemId: result.itemId,
			...fields
		});
	}
}

export const getSkillTree = query({
	args: { courseSlug: v.string() },
	returns: v.any(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const course = await ctx.db
			.query('courses')
			.withIndex('by_slug', (q) => q.eq('slug', args.courseSlug))
			.unique();
		if (!course) {
			return null;
		}

		const units = await ctx.db
			.query('units')
			.withIndex('by_course_and_order', (q) => q.eq('courseId', course._id))
			.take(100);
		const progressRows = await ctx.db
			.query('userLessonProgress')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.take(1000);
		const progressByLesson = new Map(progressRows.map((row) => [row.lessonId, row]));
		let previousComplete = true;

		const serializedUnits: any[] = [];
		for (const unit of units) {
			const lessons = await ctx.db
				.query('lessons')
				.withIndex('by_unit_and_order', (q) => q.eq('unitId', unit._id))
				.take(100);
			const serializedLessons = lessons.map((lesson) => {
				const progress = progressByLesson.get(lesson._id);
				const completed = progress?.status === 'completed';
				const status = completed ? 'completed' : previousComplete ? 'unlocked' : 'locked';
				previousComplete = completed;
				return {
					id: lesson._id,
					slug: lesson.slug,
					name: lesson.name,
					description: lesson.description,
					order: lesson.order,
					kind: lesson.kind,
					xpReward: lesson.xpReward,
					status,
					stars: progress?.stars ?? 0
				};
			});
			serializedUnits.push({
				id: unit._id,
				slug: unit.slug,
				name: unit.name,
				description: unit.description,
				order: unit.order,
				lessons: serializedLessons
			});
		}

		return {
			course: {
				id: course._id,
				slug: course.slug,
				name: course.name,
				description: course.description,
				language: course.language
			},
			units: serializedUnits
		};
	}
});

export const startLesson = query({
	args: { lessonId: v.id('lessons') },
	returns: v.any(),
	handler: async (ctx, args) => {
		await requireUser(ctx);
		const lesson = await ctx.db.get(args.lessonId);
		if (!lesson) {
			throw new ConvexError('Lesson not found');
		}
		const relationships = await ctx.db
			.query('lessonItems')
			.withIndex('by_lesson_and_order', (q) => q.eq('lessonId', args.lessonId))
			.take(100);
		const exercises: any[] = [];
		for (const relationship of relationships) {
			const item = await ctx.db.get(relationship.itemId);
			if (!item) continue;
			const serialized =
				relationship.itemTable === 'vocabulary' ? serializeVocabulary(item) : serializeDrill(item);
			for (const gameType of exerciseTypesFor(relationship.itemTable, serialized)) {
				exercises.push({
					id: `${relationship._id}:${gameType}`,
					lessonItemId: relationship._id,
					itemTable: relationship.itemTable,
					itemId: relationship.itemId,
					gameType,
					item: serialized
				});
			}
		}

		return {
			lesson: {
				id: lesson._id,
				name: lesson.name,
				description: lesson.description,
				kind: lesson.kind,
				xpReward: lesson.xpReward
			},
			exercises
		};
	}
});

export const submitLessonResult = mutation({
	args: {
		lessonId: v.id('lessons'),
		results: v.array(resultValidator),
		minutes: v.number()
	},
	returns: v.object({
		xpEarned: v.number(),
		coinsEarned: v.number(),
		stars: v.number(),
		tier: v.string(),
		currentStreak: v.number()
	}),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const profile = await getOrCreateProfile(ctx, userId);
		const lesson = await ctx.db.get(args.lessonId);
		if (!lesson) {
			throw new ConvexError('Lesson not found');
		}

		const correct = args.results.filter((result) => result.correct).length;
		const accuracy = args.results.length ? correct / args.results.length : 0;
		const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0;
		let xpEarned = Math.max(5, Math.round(lesson.xpReward * Math.max(0.4, accuracy)));

		const activeRewards = await ctx.db
			.query('userRewards')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.take(100);
		for (const userReward of activeRewards.filter((reward) => reward.active)) {
			const reward = await ctx.db.get(userReward.rewardId);
			if (reward?.kind === 'xp_boost') {
				xpEarned *= 2;
				await ctx.db.patch(userReward._id, { active: false });
				break;
			}
		}

		for (const result of args.results) {
			await upsertReview(ctx, userId, result);
		}

		const progress = await ctx.db
			.query('userLessonProgress')
			.withIndex('by_user_and_lesson', (q: any) =>
				q.eq('userId', userId).eq('lessonId', args.lessonId)
			)
			.unique();
		if (progress) {
			await ctx.db.patch(progress._id, {
				status: 'completed',
				stars: Math.max(progress.stars, stars),
				lastPlayedAt: Date.now()
			});
		} else {
			await ctx.db.insert('userLessonProgress', {
				userId,
				lessonId: args.lessonId,
				status: 'completed',
				stars,
				lastPlayedAt: Date.now()
			});
		}

		const todayKey = dayKey();
		const previousKey = previousDayKey(todayKey);
		const today = await ctx.db
			.query('dailyActivity')
			.withIndex('by_user_and_day', (q: any) => q.eq('userId', userId).eq('day', todayKey))
			.unique();
		if (today) {
			await ctx.db.patch(today._id, {
				xpEarned: today.xpEarned + xpEarned,
				lessonsCompleted: today.lessonsCompleted + 1,
				minutes: today.minutes + args.minutes
			});
		} else {
			await ctx.db.insert('dailyActivity', {
				userId,
				day: todayKey,
				xpEarned,
				lessonsCompleted: 1,
				minutes: args.minutes
			});
		}

		const nextStreak =
			profile.lastActiveDay === todayKey
				? profile.currentStreak
				: profile.lastActiveDay === previousKey
					? profile.currentStreak + 1
					: 1;
		const nextXp = profile.xp + xpEarned;
		const nextTier = tierForXp(nextXp);
		const coinsEarned = Math.max(5, Math.floor(xpEarned / 5));
		await ctx.db.patch(profile._id, {
			xp: nextXp,
			tier: nextTier,
			coins: profile.coins + coinsEarned,
			currentStreak: nextStreak,
			longestStreak: Math.max(profile.longestStreak, nextStreak),
			lastActiveDay: todayKey
		});

		return {
			xpEarned,
			coinsEarned,
			stars,
			tier: nextTier,
			currentStreak: nextStreak
		};
	}
});

export const checkAnswer = query({
	args: {
		answer: v.string(),
		accepted: v.array(v.string())
	},
	returns: v.boolean(),
	handler: async (_ctx, args) => {
		const normalized = normalizeAnswer(args.answer);
		return args.accepted.some((answer) => normalizeAnswer(answer) === normalized);
	}
});
