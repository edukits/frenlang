import { redirect } from '@sveltejs/kit';

import {
	api,
	clearAuthCookies,
	createConvexClient,
	createMissingConvexClient,
	getAuthTokens,
	setAuthCookies
} from '$lib/server/convex.js';

async function loadSession(event) {
	const { token, refreshToken } = getAuthTokens(event.cookies);

	if (token) {
		const client = createConvexClient(token);
		event.locals.convex = client;

		try {
			const user = await client.query(api.users.current);
			if (user) {
				return {
					session: { userId: user.id },
					user
				};
			}
		} catch (_error) {
			// The access token may have expired. Try the refresh token below.
		}
	}

	if (refreshToken) {
		try {
			const client = createConvexClient();
			const result = await client.action(api.auth.signIn, { refreshToken });

			if (result.tokens) {
				setAuthCookies(event.cookies, result.tokens);
				const authedClient = createConvexClient(result.tokens.token);
				event.locals.convex = authedClient;
				const user = await authedClient.query(api.users.current);

				if (user) {
					return {
						session: { userId: user.id },
						user
					};
				}
			}
		} catch (_error) {
			clearAuthCookies(event.cookies);
		}
	}

	event.locals.convex =
		event.url.pathname.startsWith('/learn') || event.url.pathname === '/auth/password'
			? createConvexClient()
			: createMissingConvexClient();
	return { session: null, user: null };
}

export const handle = async ({ event, resolve }) => {
	let cachedSession;

	event.locals.safeGetSession = event.locals.getSession = async () => {
		if (!cachedSession) {
			cachedSession = await loadSession(event);
		}
		return cachedSession;
	};

	const { session, user } = await event.locals.getSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!session && event.url.pathname.startsWith('/builder')) {
		throw redirect(303, '/sign-in');
	}

	if (!session && event.url.pathname.startsWith('/list')) {
		throw redirect(303, '/sign-in');
	}

	if (session && event.url.pathname === '/sign-in') {
		throw redirect(303, '/');
	}

	return resolve(event);
};
