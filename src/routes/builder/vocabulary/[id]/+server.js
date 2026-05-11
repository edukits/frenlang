import { api, errorMessage } from '$lib/server/convex.js';

export async function DELETE({ locals: { convex }, params: { id } }) {
	try {
		await convex.mutation(api.vocabulary.remove, { id });
		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}

export async function PATCH({ locals: { convex }, params: { id }, request }) {
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}

	try {
		const { word_type, word, translation, gender, plural_form, topic_ids } = await request.json();
		if (!word_type && !word && !translation && !gender && !plural_form && !topic_ids) {
			return new Response(JSON.stringify({ error: 'Must provide at least one field to update' }), {
				status: 400
			});
		}

		await convex.mutation(api.vocabulary.update, {
			id,
			word_type,
			word,
			translation,
			gender,
			plural_form,
			topicIds: topic_ids ?? []
		});

		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}
