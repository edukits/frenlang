export async function POST({ locals: { supabase }, request }) {
	try {
		// Validate input
		if (!request) {
			return new Response(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
		}
		const { name, description } = await request.json();
		if (!name || !description) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
		}

		// Get user ID
		const user = await supabase.auth.getUser();
		if (!user) {
			return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
		}
		console.log(user);
		const user_id = user?.data?.user?.id;

		// Insert new list entry
		const { data, error: insertError } = await supabase
			.from('lists')
			.insert({ name, description, user_id, language_id: '1' })
			.select('id');
		if (insertError) {
			return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
		}

		return new Response(JSON.stringify({ data }), { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}
