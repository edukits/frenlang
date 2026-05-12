import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	...authTables,
	vocabulary: defineTable({
		word_type: v.string(),
		word: v.string(),
		translation: v.string(),
		plural_form: v.optional(v.string()),
		gender: v.optional(v.string()),
		language_id: v.optional(v.number())
	})
		.index('by_word_type', ['word_type'])
		.index('by_word_type_word', ['word_type', 'word']),
	topics: defineTable({
		name: v.string(),
		description: v.optional(v.string())
	}).index('by_name', ['name']),
	vocabularyTopics: defineTable({
		vocabularyId: v.id('vocabulary'),
		topicId: v.id('topics')
	})
		.index('by_vocabulary', ['vocabularyId'])
		.index('by_topic', ['topicId'])
		.index('by_vocabulary_topic', ['vocabularyId', 'topicId']),
	courses: defineTable({
		slug: v.string(),
		name: v.string(),
		description: v.string(),
		language: v.string(),
		order: v.number()
	}).index('by_slug', ['slug']),
	units: defineTable({
		courseId: v.id('courses'),
		slug: v.string(),
		name: v.string(),
		description: v.string(),
		order: v.number()
	})
		.index('by_course_and_order', ['courseId', 'order'])
		.index('by_course_and_slug', ['courseId', 'slug']),
	lessons: defineTable({
		unitId: v.id('units'),
		slug: v.string(),
		name: v.string(),
		description: v.string(),
		order: v.number(),
		kind: v.union(v.literal('vocabulary'), v.literal('grammar'), v.literal('mixed')),
		xpReward: v.number()
	})
		.index('by_unit_and_order', ['unitId', 'order'])
		.index('by_unit_and_slug', ['unitId', 'slug']),
	lessonItems: defineTable({
		lessonId: v.id('lessons'),
		itemId: v.union(v.id('vocabulary'), v.id('drillItems')),
		itemTable: v.union(v.literal('vocabulary'), v.literal('drillItems')),
		order: v.number()
	})
		.index('by_lesson_and_order', ['lessonId', 'order'])
		.index('by_lesson_and_item', ['lessonId', 'itemTable', 'itemId']),
	drillItems: defineTable({
		prompt: v.string(),
		answer: v.string(),
		alternates: v.array(v.string()),
		type: v.union(
			v.literal('fill_blank'),
			v.literal('translate'),
			v.literal('transform'),
			v.literal('multiple_choice')
		),
		choices: v.optional(v.array(v.string())),
		explanation: v.optional(v.string()),
		language: v.string()
	}).index('by_type', ['type']),
	userProfiles: defineTable({
		userId: v.id('users'),
		displayName: v.string(),
		xp: v.number(),
		tier: v.string(),
		coins: v.number(),
		dailyGoalMinutes: v.number(),
		currentStreak: v.number(),
		longestStreak: v.number(),
		lastActiveDay: v.optional(v.string()),
		isAdmin: v.boolean()
	}).index('by_user', ['userId']),
	userLessonProgress: defineTable({
		userId: v.id('users'),
		lessonId: v.id('lessons'),
		status: v.union(
			v.literal('locked'),
			v.literal('unlocked'),
			v.literal('in_progress'),
			v.literal('completed')
		),
		stars: v.number(),
		lastPlayedAt: v.optional(v.number())
	})
		.index('by_user_and_lesson', ['userId', 'lessonId'])
		.index('by_user', ['userId']),
	userItemReviews: defineTable({
		userId: v.id('users'),
		itemTable: v.union(v.literal('vocabulary'), v.literal('drillItems')),
		itemId: v.union(v.id('vocabulary'), v.id('drillItems')),
		ease: v.number(),
		intervalDays: v.number(),
		dueAt: v.number(),
		lapses: v.number(),
		reps: v.number()
	})
		.index('by_user_and_dueAt', ['userId', 'dueAt'])
		.index('by_user_and_item', ['userId', 'itemTable', 'itemId']),
	dailyActivity: defineTable({
		userId: v.id('users'),
		day: v.string(),
		xpEarned: v.number(),
		lessonsCompleted: v.number(),
		minutes: v.number()
	}).index('by_user_and_day', ['userId', 'day']),
	rewards: defineTable({
		slug: v.string(),
		name: v.string(),
		description: v.string(),
		cost: v.number(),
		kind: v.union(v.literal('streak_freeze'), v.literal('cosmetic'), v.literal('xp_boost')),
		metadata: v.optional(v.record(v.string(), v.any()))
	}).index('by_slug', ['slug']),
	userRewards: defineTable({
		userId: v.id('users'),
		rewardId: v.id('rewards'),
		acquiredAt: v.number(),
		active: v.boolean()
	})
		.index('by_user', ['userId'])
		.index('by_user_and_reward', ['userId', 'rewardId'])
});
