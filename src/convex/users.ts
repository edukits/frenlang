import { getAuthUserId } from '@convex-dev/auth/server';
import { queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';

export const current = query({
	args: {},
	returns: v.union(
		v.null(),
		v.object({
			id: v.id('users'),
			email: v.optional(v.string()),
			name: v.optional(v.string()),
			image: v.optional(v.string())
		})
	),
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		const user = await ctx.db.get(userId);
		if (!user) {
			return null;
		}

		return {
			id: user._id,
			email: user.email,
			name: user.name,
			image: user.image
		};
	}
});
