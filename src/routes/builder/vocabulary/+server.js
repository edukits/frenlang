import { api, errorMessage } from '$lib/server/convex.js';

export async function POST({ locals: { convex }, request }) {
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}

	try {
		const { word_type, word, translation, plural_form, gender, topic_ids } = await request.json();
		if (!word_type || !word || !translation) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
		}

		if (word_type === 'noun' && (!plural_form || !gender)) {
			return new Response(JSON.stringify({ error: 'Nouns require plural form and gender' }), {
				status: 400
			});
		}

		const data = await convex.mutation(api.vocabulary.create, {
			word_type,
			word,
			translation,
			plural_form: word_type === 'noun' ? plural_form : undefined,
			gender: word_type === 'noun' ? gender : undefined,
			topicIds: topic_ids ?? []
		});

		return new Response(JSON.stringify({ data }), { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}
