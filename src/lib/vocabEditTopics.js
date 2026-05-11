/**
 * Add topics to a vocabulary item. Returns an object with an error message if there is an error.
 * @param {Object} supabase The Supabase client.
 * @param {number} id The ID of the vocabulary item.
 * @param {number[]} topic_ids The IDs of the topics to add.
 * @returns {Promise<{error?: {message: string}}>}
 */
export default async function addTopics(supabase, id, topic_ids) {
	// Get the current relationships
	const { data: currentRelationships, error } = await supabase
		.from('vocabulary_topics')
		.select('topic_id')
		.eq('vocabulary_id', id);

	if (error) {
		return { error };
	}

	// Get the topics that need to be added
	const topicsToAdd = topic_ids.filter(
		(topic_id) => !currentRelationships.some((rel) => rel.topic_id === topic_id)
	);

	// Get the topics that need to be removed
	const topicsToRemove = currentRelationships.filter((rel) => !topic_ids.includes(rel.topic_id));

	// Insert the new relationships
	if (topicsToAdd.length > 0) {
		const newRelationships = topicsToAdd.map((topic_id) => ({ vocabulary_id: id, topic_id }));
		const { error } = await supabase.from('vocabulary_topics').insert(newRelationships);
		if (error) {
			return { error };
		}
	}

	// Remove the old relationships
	if (topicsToRemove.length > 0) {
		const { error } = await supabase
			.from('vocabulary_topics')
			.delete()
			.in(
				'topic_id',
				topicsToRemove.map((rel) => rel.topic_id)
			)
			.eq('vocabulary_id', id);
		if (error) {
			return { error };
		}
	}

	return {};
}
