export const load = async ({ locals: { supabase }, url }) => {
	// Get query parameters
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = Number(url.searchParams.get('pageSize')) || 20;
	const orderBy = url.searchParams.get('orderBy') || 'id';
	const orderDir = url.searchParams.get('orderDir') || 'asc';
	const wordType = url.searchParams.get('wordType') || '';

	// Start building the query
	let query = supabase.from('vocabulary').select(
		`
            *,
            vocabulary_topics!left (
                topics (id, name)
            )
        `,
		{ count: 'exact' }
	);

	// Only apply the word type filter if wordType is not empty
	if (wordType) {
		query = query.eq('word_type', wordType);
	}

	// Complete the query with pagination and ordering
	const { data, error, count } = await query
		.range((page - 1) * pageSize, page * pageSize - 1)
		.order(orderBy, { ascending: orderDir === 'asc' });

	if (error) {
		console.error(error);
		throw error;
	}

	// Remap topics into vocabulary items
	const vocabulary = data.map((item) => ({
		...item,
		topics: item.vocabulary_topics.map((vt) => vt.topics)
	}));

	return {
		vocabulary: vocabulary ?? [],
		vocabSize: count ?? 0,
		page,
		pageSize,
		orderBy,
		orderDir,
		wordType
	};
};
