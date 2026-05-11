export const POST = async ({ request, locals: { supabase } }) => {
	const { email, otp } = await request.json();
	const { data, error } = await supabase.auth.verifyOtp({
		email: email,
		token: otp,
		type: 'email'
	});
	if (error) {
		return new Response(
			JSON.stringify({
				data,
				error,
				email,
				otp
			}),
			{ status: 400 }
		);
	}
	return new Response(
		JSON.stringify({
			data,
			error,
			email,
			otp
		}),
		{ status: 200 }
	);
};
