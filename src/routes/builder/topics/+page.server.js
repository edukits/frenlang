export async function load({ locals: { supabase }, url }) {
	// Get query parameters
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 10;
	const orderBy = url.searchParams.get('orderBy') || 'id';
	const orderDir = url.searchParams.get('orderDir') || 'asc';

	// Retrieve topic data
	const { data } = await supabase
		.from('topics')
		.select('*', { count: 'exact' })
		.range((page - 1) * pageSize, page * pageSize - 1)
		.order(orderBy, { ascending: orderDir === 'asc' });
	// Get total size of topics table
	const { count } = await supabase.from('topics').select('*', { count: 'exact', head: true });
	return {
		topics: data ?? [],
		topicSize: count ?? 0,
		page,
		pageSize,
		orderBy,
		orderDir
	};
}
