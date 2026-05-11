import { api, errorMessage } from '$lib/server/convex.js';

export async function PATCH({ locals: { convex }, params: { id }, request }) {
	try {
		if (!request) {
			return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
		}

		const { name, description } = await request.json();
		if (!name && !description) {
			return new Response(JSON.stringify({ error: 'Missing field(s) to update' }), { status: 400 });
		}

		await convex.mutation(api.lists.update, { id, name, description });
		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}

export async function DELETE({ locals: { convex }, params: { id } }) {
	try {
		await convex.mutation(api.lists.remove, { id });
		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}
