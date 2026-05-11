import vocabAddTopics from '$lib/vocabEditTopics.js';

export async function POST({ locals: { supabase }, request }) {
	// Validate input
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}
	const { word_type, word, translation, plural_form, gender, topic_ids } = await request.json();
	console.log(word, translation);
	if (!word_type || !word || !translation) {
		return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
	}

	// Nouns MUST have plural and gender
	if (word_type === 'noun' && (!plural_form || !gender)) {
		return new Response(JSON.stringify({ error: 'Nouns require plural form and gender' }), {
			status: 400
		});
	}

	// Check if word already exists with same word_type
	const { data: existingData, error: existingError } = await supabase
		.from('vocabulary')
		.select('id')
		.eq('word', word)
		.eq('word_type', word_type);
	if (existingError) {
		return new Response(JSON.stringify({ error: existingError.message }), { status: 500 });
	}
	if (existingData.length !== 0) {
		return new Response(
			JSON.stringify({ error: `Word "${word}" already exists as a ${word_type}` }),
			{ status: 409 }
		);
	}

	// Insert new vocabulary entry
	const { data, error: insertError } = await supabase
		.from('vocabulary')
		.insert({ word_type, word, translation, plural_form, gender, language_id: 1 })
		.select('id');
	if (insertError) {
		return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
	}

	// Add topics (if any)
	if (topic_ids && topic_ids.length !== 0) {
		const { error: topicsError } = await vocabAddTopics(supabase, data[0].id, topic_ids);
		if (topicsError) {
			return new Response(JSON.stringify({ error: topicsError.message }), { status: 500 });
		}
	}

	return new Response(JSON.stringify({ data }), { status: 201 });
}
