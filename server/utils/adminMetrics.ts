import { prisma } from '../db';

/**
 * Calculate Monthly Recurring Revenue (MRR)
 * Sum of all active subscriptions normalized to monthly revenue
 */
export async function getMonthlyRecurringRevenue(): Promise<number> {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'active' },
    select: {
      priceUsd: true,
      tier: true,
    },
  });

  const mrr = activeSubscriptions.reduce((total, sub) => {
    const price = parseFloat(sub.priceUsd.toString());
    // Yearly subscriptions contribute 1/12 of their annual price to MRR
    const monthlyValue = sub.tier === 'yearly' ? price / 12 : price;
    return total + monthlyValue;
  }, 0);

  return Math.round(mrr * 100) / 100; // Round to 2 decimal places
}

/**
 * Get count of new signups in the last N days
 */
export async function getNewSignupsCount(days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const count = await prisma.user.count({
    where: {
      createdAt: {
        gte: cutoffDate,
      },
    },
  });

  return count;
}

/**
 * Get count of active users (users with activity in last N days)
 */
export async function getActiveUsersCount(days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const count = await prisma.user.count({
    where: {
      lastActiveAt: {
        gte: cutoffDate,
      },
    },
  });

  return count;
}

/**
 * Get count of anonymous sessions in the last N days
 * (sessions that never converted to users)
 */
export async function getAnonymousSessionsCount(days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const count = await prisma.session.count({
    where: {
      isAnonymous: true,
      startedAt: {
        gte: cutoffDate,
      },
    },
  });

  return count;
}

/**
 * Get count of unique anonymous IP addresses in the last N days
 */
export async function getUniqueAnonymousIPCount(days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await prisma.session.findMany({
    where: {
      isAnonymous: true,
      startedAt: {
        gte: cutoffDate,
      },
      ipAddress: {
        not: null,
      },
    },
    select: {
      ipAddress: true,
    },
    distinct: ['ipAddress'],
  });

  return result.length;
}

/**
 * Calculate churn rate (percentage of subscriptions cancelled in last 30 days)
 */
export async function getChurnRate(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Count total active subscriptions at the start of the period
  const totalSubs = await prisma.subscription.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
      status: 'active',
    },
  });

  // Count subscriptions cancelled in the last 30 days
  const cancelledSubs = await prisma.subscription.count({
    where: {
      cancelledAt: {
        gte: thirtyDaysAgo,
      },
      status: 'cancelled',
    },
  });

  if (totalSubs === 0) return 0;

  const churnRate = (cancelledSubs / totalSubs) * 100;
  return Math.round(churnRate * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate conversion rate (percentage of anonymous sessions that resulted in signup)
 */
export async function getConversionRate(): Promise<number> {
  // Count total anonymous sessions (sessions that started as anonymous)
  const totalAnonymousSessions = await prisma.session.count({
    where: {
      isAnonymous: true,
    },
  });

  // Count signup events from anonymous sessions
  const conversions = await prisma.event.count({
    where: {
      eventType: 'signupCompleted',
      session: {
        isAnonymous: true,
      },
    },
  });

  if (totalAnonymousSessions === 0) return 0;

  const conversionRate = (conversions / totalAnonymousSessions) * 100;
  return Math.round(conversionRate * 100) / 100; // Round to 2 decimal places
}

/**
 * Get average requests per user across all users
 * Calculates based on actual UsageLog records, not User.monthlyRequestsUsed
 */
export async function getAverageRequestsPerUser(): Promise<number> {
  const totalUsers = await prisma.user.count();

  if (totalUsers === 0) return 0;

  const totalRequests = await prisma.usageLog.count();

  const average = totalRequests / totalUsers;
  return Math.round(average * 100) / 100; // Round to 2 decimal places
}

/**
 * Get popular assistant types with usage counts
 */
export async function getPopularAssistantTypes(): Promise<
  Array<{ type: string; count: number }>
> {
  const result = await prisma.usageLog.groupBy({
    by: ['assistantType'],
    _count: {
      assistantType: true,
    },
    orderBy: {
      _count: {
        assistantType: 'desc',
      },
    },
  });

  return result.map((row) => ({
    type: row.assistantType,
    count: row._count.assistantType,
  }));
}

/**
 * Get total API costs in the last N days
 */
export async function getTotalApiCosts(days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await prisma.usageLog.aggregate({
    where: {
      createdAt: {
        gte: cutoffDate,
      },
    },
    _sum: {
      costUsd: true,
    },
  });

  const total = result._sum.costUsd || 0;
  return parseFloat(total.toString()); // Return full precision for accurate cost tracking
}

/**
 * Get total tokens used in the last N days
 */
export async function getTotalTokensUsed(
  days: number
): Promise<{ input: number; output: number; total: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await prisma.usageLog.aggregate({
    where: {
      createdAt: {
        gte: cutoffDate,
      },
    },
    _sum: {
      tokensInput: true,
      tokensOutput: true,
    },
  });

  const inputTokens = result._sum.tokensInput || 0;
  const outputTokens = result._sum.tokensOutput || 0;

  return {
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens,
  };
}

/**
 * Get total number of users
 */
export async function getTotalUsersCount(): Promise<number> {
  return await prisma.user.count();
}

/**
 * Get revenue breakdown by tier
 */
export async function getRevenueBreakdown(): Promise<
  Array<{ tier: string; userCount: number; revenue: number; percentage: number }>
> {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'active' },
    select: {
      tier: true,
      priceUsd: true,
    },
  });

  // Group by tier
  const tierMap = new Map<string, { count: number; revenue: number }>();

  subscriptions.forEach((sub) => {
    const tier = sub.tier;
    const price = parseFloat(sub.priceUsd.toString());

    if (!tierMap.has(tier)) {
      tierMap.set(tier, { count: 0, revenue: 0 });
    }

    const tierData = tierMap.get(tier)!;
    tierData.count++;
    tierData.revenue += price;
  });

  // Add free tier users (users without active subscriptions)
  const freeUsers = await prisma.user.count({
    where: {
      currentTier: 'free',
    },
  });

  tierMap.set('free', { count: freeUsers, revenue: 0 });

  // Calculate total revenue for percentages
  let totalRevenue = 0;
  tierMap.forEach((data) => {
    totalRevenue += data.revenue;
  });

  // Convert to array with percentages
  const breakdown = Array.from(tierMap.entries()).map(([tier, data]) => ({
    tier,
    userCount: data.count,
    revenue: Math.round(data.revenue * 100) / 100,
    percentage: totalRevenue > 0
      ? Math.round((data.revenue / totalRevenue) * 10000) / 100
      : 0,
  }));

  // Sort by revenue descending
  return breakdown.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Get total API requests in the last N days
 */
export async function getTotalRequestsCount(days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return await prisma.usageLog.count({
    where: {
      createdAt: {
        gte: cutoffDate,
      },
    },
  });
}

/**
 * Get recent signups (last N users)
 */
export async function getRecentSignups(limit: number = 10) {
  return await prisma.user.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      email: true,
      name: true,
      currentTier: true,
      createdAt: true,
      country: true,
    },
  });
}

/**
 * Get recent usage logs (last N requests)
 */
export async function getRecentUsage(limit: number = 10) {
  return await prisma.usageLog.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      assistantType: true,
      requestType: true,
      createdAt: true,
      wasSuccessful: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Get paginated users with search and filters
 */
export async function getAllUsers(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { search = '', page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  // Build where clause for search
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        currentTier: true,
        monthlyRequestsUsed: true,
        monthlyRequestsLimit: true,
        lastActiveAt: true,
        createdAt: true,
        country: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
