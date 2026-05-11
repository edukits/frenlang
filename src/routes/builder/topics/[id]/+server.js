/**
 * PATCH /builder/topics/:id/+server
 * Patch a topic. Only the name and description fields can be updated.
 * @param supabase
 * @param id
 * @param request
 * @returns {Promise<Response>}
 * @constructor
 */
export async function PATCH({ locals: { supabase }, params: { id }, request }) {
	// Validate input
	if (!request) {
		return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
	}
	const { name, description } = await request.json();
	if (!name && !description) {
		return new Response(JSON.stringify({ error: 'Must provide at least one field to update' }), {
			status: 400
		});
	}

	// Only update the fields that were provided
	const fieldsToUpdate = {
		...(name && { name }),
		...(description && { description })
	};

	console.log(fieldsToUpdate);

	// Update the topic
	const { error } = await supabase.from('topics').update(fieldsToUpdate).eq('id', id);
	if (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}

	return new Response(JSON.stringify({}), { status: 200 });
}
