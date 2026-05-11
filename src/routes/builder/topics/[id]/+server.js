import { api, errorMessage } from '$lib/server/convex.js';

export async function PATCH({ locals: { convex }, params: { id }, request }) {
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}

	try {
		const { name, description } = await request.json();
		if (!name && !description) {
			return new Response(JSON.stringify({ error: 'Must provide at least one field to update' }), {
				status: 400
			});
		}

		await convex.mutation(api.topics.update, { id, name, description });
		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}

export async function DELETE({ locals: { convex }, params: { id } }) {
	try {
		await convex.mutation(api.topics.remove, { id });
		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}
