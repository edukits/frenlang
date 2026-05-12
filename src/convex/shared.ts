import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';

export async function requireUser(ctx: any) {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new ConvexError('Not authenticated');
	}
	return userId;
}

export function tierForXp(xp: number) {
	if (xp >= 20000) return 'Diamond';
	if (xp >= 10000) return 'Platinum';
	if (xp >= 5000) return 'Gold';
	if (xp >= 1500) return 'Silver';
	return 'Bronze';
}

export function dayKey(timestamp = Date.now()) {
	return new Date(timestamp).toISOString().slice(0, 10);
}

export function previousDayKey(day: string) {
	const date = new Date(`${day}T00:00:00.000Z`);
	date.setUTCDate(date.getUTCDate() - 1);
	return date.toISOString().slice(0, 10);
}

export async function getProfile(ctx: any, userId: any) {
	return await ctx.db
		.query('userProfiles')
		.withIndex('by_user', (q: any) => q.eq('userId', userId))
		.unique();
}

export async function getOrCreateProfile(ctx: any, userId: any) {
	const profile = await getProfile(ctx, userId);
	const user = await ctx.db.get(userId);
	const adminEmails = (process.env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean);
	const isAdmin = Boolean(user?.email && adminEmails.includes(user.email.toLowerCase()));
	if (profile) {
		if (isAdmin && !profile.isAdmin) {
			await ctx.db.patch(profile._id, { isAdmin: true });
			return await ctx.db.get(profile._id);
		}
		return profile;
	}

	const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Learner';

	const id = await ctx.db.insert('userProfiles', {
		userId,
		displayName,
		xp: 0,
		tier: 'Bronze',
		coins: 0,
		dailyGoalMinutes: 10,
		currentStreak: 0,
		longestStreak: 0,
		isAdmin
	});
	return await ctx.db.get(id);
}

export async function requireAdmin(ctx: any) {
	const userId = await requireUser(ctx);
	const profile = await getOrCreateProfile(ctx, userId);
	if (!profile?.isAdmin) {
		throw new ConvexError('Admin access required');
	}
	return { userId, profile };
}

export function slugify(value: string) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function normalizeAnswer(value: string) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ');
}
