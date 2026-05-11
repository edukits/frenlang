import { api, errorMessage } from '$lib/server/convex.js';

export async function DELETE({ locals: { convex }, params: { id }, request }) {
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}

	try {
		const { vocabulary_ids } = await request.json();
		if (!vocabulary_ids || !Array.isArray(vocabulary_ids)) {
			return new Response(
				JSON.stringify({ error: 'Must provide an array of vocabulary_ids to delete' }),
				{ status: 400 }
			);
		}

		await convex.mutation(api.lists.removeVocabulary, {
			id,
			vocabularyIds: vocabulary_ids
		});

		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}

export async function POST({ locals: { convex }, params: { id }, request }) {
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}

	try {
		const { vocabulary_ids } = await request.json();
		if (!vocabulary_ids || !Array.isArray(vocabulary_ids)) {
			return new Response(
				JSON.stringify({ error: 'Must provide an array of vocabulary_ids to add' }),
				{ status: 400 }
			);
		}

		await convex.mutation(api.lists.addVocabulary, {
			id,
			vocabularyIds: vocabulary_ids
		});

		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}
