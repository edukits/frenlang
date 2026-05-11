import { ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

const AUTH_TOKEN_COOKIE = 'frenlang_convex_token';
const REFRESH_TOKEN_COOKIE = 'frenlang_convex_refresh';
const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	secure: process.env.NODE_ENV === 'production',
	maxAge: 60 * 60 * 24 * 30
};

function getConvexUrl() {
	const url =
		privateEnv.CONVEX_URL ??
		privateEnv.VITE_CONVEX_URL ??
		privateEnv.NEXT_PUBLIC_CONVEX_URL ??
		publicEnv.PUBLIC_CONVEX_URL;
	if (!url) {
		throw new Error(
			'Missing Convex deployment URL. Set CONVEX_URL, PUBLIC_CONVEX_URL, or VITE_CONVEX_URL.'
		);
	}
	return url;
}

export function createConvexClient(token) {
	const client = new ConvexHttpClient(getConvexUrl());
	if (token) {
		client.setAuth(token);
	}
	return client;
}

export function createMissingConvexClient() {
	const missing = () => {
		throw new Error(
			'Missing Convex deployment URL. Set CONVEX_URL, PUBLIC_CONVEX_URL, or VITE_CONVEX_URL.'
		);
	};

	return {
		query: missing,
		mutation: missing,
		action: missing
	};
}

export function getAuthTokens(cookies) {
	return {
		token: cookies.get(AUTH_TOKEN_COOKIE) ?? null,
		refreshToken: cookies.get(REFRESH_TOKEN_COOKIE) ?? null
	};
}

export function setAuthCookies(cookies, tokens) {
	cookies.set(AUTH_TOKEN_COOKIE, tokens.token, COOKIE_OPTIONS);
	cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
}

export function clearAuthCookies(cookies) {
	cookies.delete(AUTH_TOKEN_COOKIE, { path: '/' });
	cookies.delete(REFRESH_TOKEN_COOKIE, { path: '/' });
}

export function errorMessage(error) {
	if (error instanceof Error) {
		return error.message;
	}
	return 'Unknown error';
}

export const api = anyApi;
