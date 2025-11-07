import { prisma } from '../db';

// Tier limits configuration
const TIER_LIMITS = {
  free: 10,
  monthly: 300,
  yearly: 400,
} as const;

export type Tier = keyof typeof TIER_LIMITS;

export interface UsageLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Get the monthly request limit for a given tier
 */
export function getTierLimits(tier: string): number {
  if (tier in TIER_LIMITS) {
    return TIER_LIMITS[tier as Tier];
  }
  return TIER_LIMITS.free; // Default to free tier
}

/**
 * Check if user has remaining usage quota
 * Automatically resets quota if 30 days have passed
 */
export async function checkUsageLimit(userId: string): Promise<UsageLimitResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Check if we need to reset monthly usage (30 days have passed)
  const daysSinceReset = Math.floor(
    (Date.now() - new Date(user.lastResetDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceReset >= 30) {
    await resetMonthlyUsage(userId);
    return {
      allowed: true,
      remaining: user.monthlyRequestsLimit,
    };
  }

  const remaining = user.monthlyRequestsLimit - user.monthlyRequestsUsed;
  const allowed = remaining > 0;

  return {
    allowed,
    remaining: Math.max(0, remaining),
  };
}

/**
 * Increment user's monthly usage counter
 */
export async function incrementUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyRequestsUsed: { increment: 1 },
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Reset user's monthly usage counter and update reset date
 */
export async function resetMonthlyUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyRequestsUsed: 0,
      lastResetDate: new Date(),
      updatedAt: new Date(),
    },
  });
}
