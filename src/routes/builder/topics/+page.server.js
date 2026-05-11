import { api } from '$lib/server/convex.js';

export async function load({ locals: { convex }, url }) {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 10;
	const orderBy = url.searchParams.get('orderBy') || 'id';
	const orderDir = url.searchParams.get('orderDir') || 'asc';
	const result = await convex.query(api.topics.list, {
		page,
		pageSize,
		orderBy,
		orderDir
	});

	return {
		...result,
		page,
		pageSize,
		orderBy,
		orderDir
	};
}
