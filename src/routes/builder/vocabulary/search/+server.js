export async function GET({ locals: { supabase }, url }) {
	// Get query parameters
	const search = url.searchParams.get('search') || '';
	const limit = Number(url.searchParams.get('limit')) || 10;
	const excludeIdsParam = url.searchParams.get('exclude') || '[]';
	const excludeIds = JSON.parse(excludeIdsParam);

	let query = supabase.from('vocabulary').select();

	if (search) {
		query = query.textSearch('word', `'${search}'`);
	}

	if (excludeIds.length > 0) {
		query = query.not('id', 'in', `(${excludeIds.join(',')})`);
	}

	const { error, data } = await query.limit(limit);

	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}

	return new Response(JSON.stringify(data), { status: 200 });
}
