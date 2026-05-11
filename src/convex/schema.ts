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
	lists: defineTable({
		name: v.string(),
		description: v.string(),
		userId: v.id('users'),
		language_id: v.optional(v.number())
	}).index('by_user', ['userId']),
	vocabularyLists: defineTable({
		listId: v.id('lists'),
		vocabularyId: v.id('vocabulary')
	})
		.index('by_list', ['listId'])
		.index('by_vocabulary', ['vocabularyId'])
		.index('by_list_vocabulary', ['listId', 'vocabularyId'])
});
