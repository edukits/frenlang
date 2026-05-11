/**
 * DELETE /list/:id/vocabulary
 * Delete a list of vocabulary items from the list.
 * @param supabase
 * @param id
 * @param request
 * @returns {Promise<Response>}
 * @constructor
 */
export async function DELETE({ locals: { supabase }, params: { id }, request }) {
	// Validate input
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}
	const { vocabulary_ids } = await request.json();
	if (!vocabulary_ids || !Array.isArray(vocabulary_ids)) {
		return new Response(
			JSON.stringify({ error: 'Must provide an array of vocabulary_ids to delete' }),
			{ status: 400 }
		);
	}

	// Delete the vocabulary items
	const { error: deleteError } = await supabase
		.from('vocabulary_lists')
		.delete()
		.in('vocabulary_id', vocabulary_ids)
		.eq('list_id', id);

	if (deleteError) {
		return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
	}

	return new Response(JSON.stringify({}), { status: 200 });
}

/**
 * POST /list/:id/vocabulary
 * Add vocabulary items to the list.
 * @param supabase
 * @param id
 * @param request
 * @returns {Promise<Response>}
 * @constructor
 */
export async function POST({ locals: { supabase }, params: { id }, request }) {
	// Validate input
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}
	const { vocabulary_ids } = await request.json();
	if (!vocabulary_ids || !Array.isArray(vocabulary_ids)) {
		return new Response(
			JSON.stringify({ error: 'Must provide an array of vocabulary_ids to add' }),
			{ status: 400 }
		);
	}

	console.log('vocabulary_ids', vocabulary_ids);
	console.log(
		'insert data',
		vocabulary_ids.map((vocabulary_id) => ({ list_id: id, vocabulary_id }))
	);

	// Insert the vocabulary items
	const { error: insertError } = await supabase
		.from('vocabulary_lists')
		.insert(vocabulary_ids.map((vocabulary_id) => ({ list_id: id, vocabulary_id })));

	if (insertError) {
		console.log(insertError);
		console.log(insertError.message);
		return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
	}

	return new Response(JSON.stringify({}), { status: 200 });
}
