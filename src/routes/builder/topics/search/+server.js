import { api, errorMessage } from '$lib/server/convex.js';

export async function GET({ locals: { convex }, url }) {
	const search = url.searchParams.get('search') || '';
	const limit = Number(url.searchParams.get('limit')) || 10;
	const excludeIdsParam = url.searchParams.get('exclude') || '[]';
	const excludeIds = JSON.parse(excludeIdsParam);

	try {
		const data = await convex.query(api.topics.search, {
			search,
			limit,
			excludeIds
		});

		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: errorMessage(error) }), { status: 500 });
	}
}
