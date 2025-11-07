import { sql, eq, and, gte } from 'drizzle-orm';
import { db } from '../db';
import { users, subscriptions, usageLogs, sessions, events } from '../../shared/schema';

/**
 * Calculate Monthly Recurring Revenue (MRR)
 * Sum of all active subscriptions normalized to monthly revenue
 */
export async function getMonthlyRecurringRevenue(): Promise<number> {
  const activeSubscriptions = await db
    .select({
      priceUsd: subscriptions.priceUsd,
      tier: subscriptions.tier,
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'));

  const mrr = activeSubscriptions.reduce((total, sub) => {
    const price = parseFloat(sub.priceUsd);
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

  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(users)
    .where(gte(users.createdAt, cutoffDate));

  return result[0]?.count || 0;
}

/**
 * Get count of active users (users with activity in last N days)
 */
export async function getActiveUsersCount(days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(users)
    .where(gte(users.lastActiveAt, cutoffDate));

  return result[0]?.count || 0;
}

/**
 * Calculate churn rate (percentage of subscriptions cancelled in last 30 days)
 */
export async function getChurnRate(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Count total active subscriptions at the start of the period
  const totalSubsResult = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(subscriptions)
    .where(
      and(
        gte(subscriptions.createdAt, thirtyDaysAgo),
        eq(subscriptions.status, 'active')
      )
    );

  // Count subscriptions cancelled in the last 30 days
  const cancelledSubsResult = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(subscriptions)
    .where(
      and(
        gte(subscriptions.cancelledAt, thirtyDaysAgo),
        eq(subscriptions.status, 'cancelled')
      )
    );

  const totalSubs = totalSubsResult[0]?.count || 0;
  const cancelledSubs = cancelledSubsResult[0]?.count || 0;

  if (totalSubs === 0) return 0;

  const churnRate = (cancelledSubs / totalSubs) * 100;
  return Math.round(churnRate * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate conversion rate (percentage of anonymous sessions that resulted in signup)
 */
export async function getConversionRate(): Promise<number> {
  // Count total anonymous sessions (sessions that started as anonymous)
  const anonymousSessionsResult = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(sessions)
    .where(eq(sessions.isAnonymous, true));

  // Count signup events
  const signupEventsResult = await db
    .select({ count: sql<number>`cast(count(distinct ${sessions.id}) as integer)` })
    .from(events)
    .innerJoin(sessions, eq(events.sessionId, sessions.id))
    .where(
      and(
        eq(sessions.isAnonymous, true),
        eq(events.eventType, 'signupCompleted')
      )
    );

  const totalAnonymousSessions = anonymousSessionsResult[0]?.count || 0;
  const conversions = signupEventsResult[0]?.count || 0;

  if (totalAnonymousSessions === 0) return 0;

  const conversionRate = (conversions / totalAnonymousSessions) * 100;
  return Math.round(conversionRate * 100) / 100; // Round to 2 decimal places
}

/**
 * Get average requests per user across all users
 */
export async function getAverageRequestsPerUser(): Promise<number> {
  const result = await db
    .select({
      avg: sql<number>`cast(avg(${users.monthlyRequestsUsed}) as decimal)`,
    })
    .from(users);

  const average = result[0]?.avg || 0;
  return Math.round(parseFloat(average.toString()) * 100) / 100; // Round to 2 decimal places
}

/**
 * Get popular assistant types with usage counts
 */
export async function getPopularAssistantTypes(): Promise<
  Array<{ type: string; count: number }>
> {
  const result = await db
    .select({
      type: usageLogs.assistantType,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(usageLogs)
    .groupBy(usageLogs.assistantType)
    .orderBy(sql`count(*) desc`);

  return result.map((row) => ({
    type: row.type,
    count: row.count,
  }));
}

/**
 * Get total API costs in the last N days
 */
export async function getTotalApiCosts(days: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await db
    .select({
      total: sql<number>`cast(sum(${usageLogs.costUsd}) as decimal)`,
    })
    .from(usageLogs)
    .where(gte(usageLogs.createdAt, cutoffDate));

  const total = result[0]?.total || 0;
  return Math.round(parseFloat(total.toString()) * 100) / 100; // Round to 2 decimal places
}

/**
 * Get total tokens used in the last N days
 */
export async function getTotalTokensUsed(
  days: number
): Promise<{ input: number; output: number; total: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await db
    .select({
      inputTokens: sql<number>`cast(sum(${usageLogs.tokensInput}) as integer)`,
      outputTokens: sql<number>`cast(sum(${usageLogs.tokensOutput}) as integer)`,
    })
    .from(usageLogs)
    .where(gte(usageLogs.createdAt, cutoffDate));

  const inputTokens = result[0]?.inputTokens || 0;
  const outputTokens = result[0]?.outputTokens || 0;

  return {
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens,
  };
}
