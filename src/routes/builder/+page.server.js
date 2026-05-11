import { api } from '$lib/server/convex.js';

export const load = async ({ locals: { convex } }) => {
	const [vocabSize, topicSize] = await Promise.all([
		convex.query(api.vocabulary.count),
		convex.query(api.topics.count)
	]);

	return { vocabSize, topicSize };
};
