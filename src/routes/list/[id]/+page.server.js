import { error } from '@sveltejs/kit';

export const load = async ({ locals: { supabase }, params: { id } }) => {
	// Retrieve the list entry with the given ID along with its vocabulary entries
	const { data: list, error: listError } = await supabase
		.from('lists')
		.select(
			`
            *,
            vocabulary_lists (
                vocabulary: vocabulary(*)
            )
        `
		)
		.eq('id', id)
		.single();

	if (listError) {
		if (listError.code === 'PGRST116') {
			error(404, 'List entry not found');
		} else {
			error(500, 'Error retrieving data');
		}
	}

	// Extract vocabulary entries
	list.vocabulary = list.vocabulary_lists.map(({ vocabulary }) => vocabulary);

	// Remove the intermediate relation array
	delete list.vocabulary_lists;

	return { list };
};
