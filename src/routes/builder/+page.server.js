export const load = async ({ locals: { supabase } }) => {
	const { count: vocabSize } = await supabase
		.from('vocabulary')
		.select('*', { count: 'exact', head: true });

	const { count: topicSize } = await supabase
		.from('topics')
		.select('*', { count: 'exact', head: true });

	return { vocabSize, topicSize };
};
