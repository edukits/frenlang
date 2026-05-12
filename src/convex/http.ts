import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import { auth } from './auth';

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
	path: '/admin/ingest',
	method: 'POST',
	handler: httpAction(async (ctx, req) => {
		const expected = process.env.ADMIN_INGEST_TOKEN;
		const authorization = req.headers.get('authorization') ?? '';
		const token = authorization.replace(/^Bearer\s+/i, '').trim();

		if (!expected || token !== expected) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const payload = await req.json();
		const result = await ctx.runMutation((internal as any).content.ingest.bulkUpsert, payload);
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	})
});

export default http;
