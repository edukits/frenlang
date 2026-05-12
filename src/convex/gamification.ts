import { ConvexError, v } from 'convex/values';
import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { getOrCreateProfile, requireUser, tierForXp } from './shared';

const rewardKind = v.union(
	v.literal('streak_freeze'),
	v.literal('cosmetic'),
	v.literal('xp_boost')
);

function serializeReward(reward: any) {
	return {
		id: reward._id,
		slug: reward.slug,
		name: reward.name,
		description: reward.description,
		cost: reward.cost,
		kind: reward.kind,
		metadata: reward.metadata
	};
}

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

export const getProfile = query({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		const userId = await requireUser(ctx);
		const profile = await ctx.db
			.query('userProfiles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.unique();
		return profile ? serializeProfile(profile) : null;
	}
});

export const getDashboard = query({
	args: { day: v.string() },
	returns: v.any(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const profile = await ctx.db
			.query('userProfiles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.unique();
		const today = await ctx.db
			.query('dailyActivity')
			.withIndex('by_user_and_day', (q: any) => q.eq('userId', userId).eq('day', args.day))
			.unique();
		const rewards = await ctx.db
			.query('userRewards')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.take(50);

		return {
			profile: profile ? serializeProfile(profile) : null,
			today: today
				? {
						xpEarned: today.xpEarned,
						lessonsCompleted: today.lessonsCompleted,
						minutes: today.minutes
					}
				: { xpEarned: 0, lessonsCompleted: 0, minutes: 0 },
			activeRewards: rewards.filter((reward) => reward.active).length
		};
	}
});

export const listRewards = query({
	args: {},
	returns: v.array(
		v.object({
			id: v.id('rewards'),
			slug: v.string(),
			name: v.string(),
			description: v.string(),
			cost: v.number(),
			kind: rewardKind,
			metadata: v.optional(v.record(v.string(), v.any()))
		})
	),
	handler: async (ctx) => {
		await requireUser(ctx);
		const rewards = await ctx.db.query('rewards').take(100);
		return rewards.sort((a, b) => a.cost - b.cost).map(serializeReward);
	}
});

export const seedRewards = mutation({
	args: {},
	returns: v.null(),
	handler: async (ctx) => {
		await requireUser(ctx);
		const defaults = [
			{
				slug: 'streak-freeze',
				name: 'Streak Freeze',
				description: 'Protect one missed day.',
				cost: 80,
				kind: 'streak_freeze' as const
			},
			{
				slug: 'xp-boost',
				name: 'XP Boost',
				description: 'Double XP on your next completed lesson.',
				cost: 120,
				kind: 'xp_boost' as const
			},
			{
				slug: 'blue-badge',
				name: 'Blue Badge',
				description: 'A cosmetic learner badge for your profile.',
				cost: 200,
				kind: 'cosmetic' as const
			}
		];

		for (const reward of defaults) {
			const existing = await ctx.db
				.query('rewards')
				.withIndex('by_slug', (q) => q.eq('slug', reward.slug))
				.unique();
			if (existing) {
				await ctx.db.patch(existing._id, reward);
			} else {
				await ctx.db.insert('rewards', reward);
			}
		}
		return null;
	}
});

export const purchaseReward = mutation({
	args: { rewardId: v.id('rewards') },
	returns: v.null(),
	handler: async (ctx, args) => {
		const userId = await requireUser(ctx);
		const profile = await getOrCreateProfile(ctx, userId);
		const reward = await ctx.db.get(args.rewardId);
		if (!reward) {
			throw new ConvexError('Reward not found');
		}
		if (profile.coins < reward.cost) {
			throw new ConvexError('Not enough coins');
		}

		await ctx.db.patch(profile._id, { coins: profile.coins - reward.cost });
		await ctx.db.insert('userRewards', {
			userId,
			rewardId: args.rewardId,
			acquiredAt: Date.now(),
			active: reward.kind !== 'cosmetic'
		});
		return null;
	}
});

export const recomputeTier = mutation({
	args: {},
	returns: v.string(),
	handler: async (ctx) => {
		const userId = await requireUser(ctx);
		const profile = await getOrCreateProfile(ctx, userId);
		const tier = tierForXp(profile.xp);
		await ctx.db.patch(profile._id, { tier });
		return tier;
	}
});
