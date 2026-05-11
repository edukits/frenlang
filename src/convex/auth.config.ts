export default {
	providers: [
		{
			domain: process.env.CONVEX_SITE_URL ?? process.env.PUBLIC_CONVEX_SITE_URL,
			applicationID: 'convex'
		}
	]
};
