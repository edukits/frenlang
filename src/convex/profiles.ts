import { v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { getOrCreateProfile, getProfile, requireAdmin, requireUser } from './shared';

const profileReturn = v.object({
	id: v.id('userProfiles'),
	userId: v.id('users'),
	displayName: v.string(),
	xp: v.number(),
	tier: v.string(),
	coins: v.number(),
	dailyGoalMinutes: v.number(),
	currentStreak: v.number(),
	longestStreak: v.number(),
	lastActiveDay: v.optional(v.string()),
	isAdmin: v.boolean()
});

function serializeProfile(profile: any) {
	return {
		id: profile._id,
		userId: profile.userId,
		displayName: profile.displayName,
		xp: profile.xp,
		tier: profile.tier,
		coins: profile.coins,
		dailyGoalMinutes: profile.dailyGoalMinutes,
		currentStreak: profile.currentStreak,
		longestStreak: profile.longestStreak,
		lastActiveDay: profile.lastActiveDay,
		isAdmin: profile.isAdmin
	};
}

export const current = query({
	args: {},
	returns: v.union(v.null(), profileReturn),
	handler: async (ctx) => {
		const userId = await requireUser(ctx);
		const profile = await getProfile(ctx, userId);
		if (!profile) {
			return null;
		}
		return serializeProfile(profile);
	}
});

export const ensureCurrent = mutation({
	args: {},
	returns: profileReturn,
	handler: async (ctx) => {
		const userId = await requireUser(ctx);
		const profile = await getOrCreateProfile(ctx, userId);
		return serializeProfile(profile);
	}
});

export const updateSettings = mutation({
	args: {
		displayName: v.optional(v.string()),
		dailyGoalMinutes: v.optional(v.number())
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const profile = await getOrCreateProfile(ctx, userId);
		const fields: Record<string, string | number> = {};
		if (args.displayName) fields.displayName = args.displayName;
		if (args.dailyGoalMinutes) fields.dailyGoalMinutes = args.dailyGoalMinutes;
		if (Object.keys(fields).length > 0) {
			await ctx.db.patch(profile._id, fields);
		}
		return null;
	}
});

export const setAdmin = mutation({
	args: {
		userId: v.id('users'),
		isAdmin: v.boolean()
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		const profile = await getOrCreateProfile(ctx, args.userId);
		await ctx.db.patch(profile._id, { isAdmin: args.isAdmin });
		return null;
	}
});
