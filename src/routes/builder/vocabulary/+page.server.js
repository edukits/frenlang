import { api } from '$lib/server/convex.js';

export const load = async ({ locals: { convex }, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 20;
	const orderBy = url.searchParams.get('orderBy') || 'id';
	const orderDir = url.searchParams.get('orderDir') || 'asc';
	const wordType = url.searchParams.get('wordType') || '';
	const result = await convex.query(api.vocabulary.list, {
		page,
		pageSize,
		orderBy,
		orderDir,
		wordType
	});

	return {
		...result,
		page,
		pageSize,
		orderBy,
		orderDir,
		wordType
	};
};
