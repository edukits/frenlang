import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;

	const redirectTo = url.searchParams.get('next') ?? '/';
	const { error } = await supabase.auth.signOut();

	if (error) {
		// @todo: handle
	}

	throw redirect(303, redirectTo);
};
