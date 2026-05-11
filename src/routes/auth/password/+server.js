import { json } from '@sveltejs/kit';

import { api, errorMessage, setAuthCookies } from '$lib/server/convex.js';

export const POST = async ({ request, locals: { convex }, cookies }) => {
	try {
		const { email, password, flow } = await request.json();
		if (!email || !password || !['signIn', 'signUp'].includes(flow)) {
			return json({ error: 'Missing email, password, or authentication mode' }, { status: 400 });
		}

		const result = await convex.action(api.auth.signIn, {
			provider: 'password',
			params: {
				email,
				password,
				flow
			}
		});

		if (!result.tokens) {
			return json({ error: 'Authentication did not return a session' }, { status: 400 });
		}

		setAuthCookies(cookies, result.tokens);
		return json({ data: { session: true } }, { status: 200 });
	} catch (error) {
		return json({ error: errorMessage(error) }, { status: 400 });
	}
};
