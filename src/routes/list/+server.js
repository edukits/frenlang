import { api, errorMessage } from '$lib/server/convex.js';

export async function POST({ locals: { convex }, request }) {
	try {
		if (!request) {
			return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
		}

		const { name, description } = await request.json();
		if (!name || !description) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
		}

		const data = await convex.mutation(api.lists.create, { name, description });
		return new Response(JSON.stringify({ data }), { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}
