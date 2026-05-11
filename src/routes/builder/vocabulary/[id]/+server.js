import vocabAddTopic from '$lib/vocabEditTopics.js';

export async function DELETE({ locals: { supabase }, params: { id } }) {
	const result = await supabase.from('vocabulary').delete().eq('id', id);
	const { error } = result;

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}

	return new Response(JSON.stringify({}), { status: 200 });
}

export async function PATCH({ locals: { supabase }, params: { id }, request }) {
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}

	const { word_type, word, translation, gender, plural_form, topic_ids } = await request.json();
	if (!word_type && !word && !translation && !gender && !plural_form && !topic_ids) {
		return new Response(JSON.stringify({ error: 'Must provide at least one field to update' }), {
			status: 400
		});
	}

	const fieldsToUpdate = {
		...(word_type && { word_type }),
		...(word && { word }),
		...(translation && { translation }),
		...(gender && { gender }),
		...(plural_form && { plural_form })
	};

	// Update the vocabulary entry
	const { error: updateVocabError } = await supabase
		.from('vocabulary')
		.update(fieldsToUpdate)
		.eq('id', id);
	if (updateVocabError) {
		return new Response(JSON.stringify({ error: updateVocabError.message }), { status: 500 });
	}

	// Vocabulary/Topics are related in the vocabulary_topics table
	// Insert any new relationships
	const { error: updateTopicsError } = await vocabAddTopic(supabase, Number(id), topic_ids ?? []);
	if (updateTopicsError) {
		return new Response(JSON.stringify({ error: updateTopicsError.message }), { status: 500 });
	}

	return new Response(JSON.stringify({}), { status: 200 });
}
