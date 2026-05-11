export async function load({ locals: { supabase } }) {
	const { data } = await supabase.from('vocabulary').select('*', { count: 'exact' });
	return {
		vocabulary: data ?? []
	};
}
