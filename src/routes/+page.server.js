import { error as kitError } from '@sveltejs/kit';

export const load = async ({ locals: { session, supabase } }) => {
	if (!session) {
		return {
			lists: []
		};
	}

	const { data, error: loadError } = await supabase
		.from('lists')
		.select(
			`
            *,
            vocab_count:vocabulary_lists(count)
        `
		)
		// Order by newest first
		.order('id', { ascending: false });

	if (loadError) {
		console.error('Error loading lists:', loadError.message);
		kitError(500, 'Failed to load lists');
	}

	// Transform the data to extract the count number
	const lists = (data ?? []).map((list) => ({
		...list,
		vocabulary_count: list.vocab_count[0]?.count || 0
	}));

	return {
		lists: lists ?? []
	};
};
