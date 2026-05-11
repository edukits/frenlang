import { error } from '@sveltejs/kit';

export const load = async ({ locals: { supabase }, params: { id } }) => {
	// Retrieve the entry with the given ID
	const { data: item } = await supabase.from('vocabulary').select('*').eq('id', id).single();

	// If the entry does not exist, return a 404 response
	if (!item) {
		error(404, 'Vocabulary entry not found');
	}

	// The vocabulary_topics table links vocabulary entries to topics
	// Retrieve the topics that are linked to this vocabulary entry
	const { data: topics } = await supabase
		.from('vocabulary_topics')
		.select(
			`
            topic_id,
            topics (id, name, description)
        `
		)
		.eq('vocabulary_id', id);

	item.topics = (topics ?? []).map(({ topics }) => topics);

	return { item };
};
