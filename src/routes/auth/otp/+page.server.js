export async function load({ url }) {
	let email = url.searchParams.get('email');
	return { email };
}
