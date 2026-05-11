export async function PATCH({ locals: { supabase }, params: { id }, request }) {
	try {
		// Validate input
		if (!request) {
			return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
		}
		const { name, description } = await request.json();
		if (!name && !description) {
			return new Response(JSON.stringify({ error: 'Missing field(s) to update' }), { status: 400 });
		}

		// Update list entry
		const { data, error: updateError } = await supabase
			.from('lists')
			.update({ name, description })
			.match({ id });
		if (updateError) {
			return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
		}

		return new Response(JSON.stringify({ data }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}

export async function DELETE({ locals: { supabase }, params: { id } }) {
	try {
		// Delete list entry
		const { error: deleteError } = await supabase.from('lists').delete().match({ id });
		if (deleteError) {
			return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
		}

		return new Response(JSON.stringify({}), { status: 200 });
	} catch (error) {
		console.log(error);
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}
