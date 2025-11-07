import { Router } from 'express';
import {
  getTotalUsersCount,
  getActiveUsersCount,
  getAnonymousSessionsCount,
  getUniqueAnonymousIPCount,
  getMonthlyRecurringRevenue,
  getNewSignupsCount,
  getRevenueBreakdown,
  getTotalRequestsCount,
  getAverageRequestsPerUser,
  getPopularAssistantTypes,
  getRecentSignups,
  getRecentUsage,
  getChurnRate,
  getConversionRate,
  getAllUsers,
  getTotalApiCosts,
} from '../utils/adminMetrics';
import { prisma } from '../db';

const router = Router();

console.log('✓ Admin routes module loaded');

/**
 * GET /api/admin/overview
 * Returns overview metrics: total users, active users, MRR, new signups
 */
router.get('/overview', async (req, res) => {
  console.log('📊 GET /api/admin/overview - Request received');
  try {
    console.log('   → Fetching total users count...');
    const totalUsers = await getTotalUsersCount();
    console.log(`   ✓ Total users: ${totalUsers}`);

    console.log('   → Fetching active users (30d)...');
    const activeUsers30d = await getActiveUsersCount(30);
    console.log(`   ✓ Active users (30d): ${activeUsers30d}`);

    console.log('   → Calculating MRR...');
    const mrr = await getMonthlyRecurringRevenue();
    console.log(`   ✓ MRR: $${mrr}`);

    console.log('   → Fetching new signups (7d)...');
    const newSignups7d = await getNewSignupsCount(7);
    console.log(`   ✓ New signups (7d): ${newSignups7d}`);

    console.log('   → Calculating monthly API costs (30d)...');
    const monthlyApiCosts = await getTotalApiCosts(30);
    console.log(`   ✓ Monthly API costs: $${monthlyApiCosts}`);

    console.log('   → Counting unique anonymous IPs (30d)...');
    const uniqueAnonymousIPs30d = await getUniqueAnonymousIPCount(30);
    console.log(`   ✓ Unique anonymous IPs (30d): ${uniqueAnonymousIPs30d}`);

    const response = {
      totalUsers,
      activeUsers30d,
      mrr,
      newSignups7d,
      monthlyApiCosts,
      uniqueAnonymousIPs30d,
    };

    console.log('✅ Overview data fetched successfully');
    res.json(response);
  } catch (error) {
    console.error('❌ Error in /api/admin/overview:');
    console.error('   Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('   Stack trace:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    res.status(500).json({
      error: 'Failed to fetch overview metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Check if database tables exist. Run: npm run db:push',
    });
  }
});

/**
 * GET /api/admin/revenue-breakdown
 * Returns revenue breakdown by tier
 */
router.get('/revenue-breakdown', async (req, res) => {
  console.log('💰 GET /api/admin/revenue-breakdown - Request received');
  try {
    console.log('   → Fetching revenue breakdown by tier...');
    const breakdown = await getRevenueBreakdown();
    console.log(`   ✓ Found ${breakdown.length} tiers`);
    console.log('💰 Revenue breakdown:', JSON.stringify(breakdown, null, 2));
    res.json(breakdown);
  } catch (error) {
    console.error('❌ Error in /api/admin/revenue-breakdown:');
    console.error('   Details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      error: 'Failed to fetch revenue breakdown',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Ensure Subscription table exists in database',
    });
  }
});

/**
 * GET /api/admin/usage-stats
 * Returns usage statistics: total requests, avg per user, popular types
 */
router.get('/usage-stats', async (req, res) => {
  console.log('📈 GET /api/admin/usage-stats - Request received');
  try {
    console.log('   → Fetching total requests (30d)...');
    const totalRequests = await getTotalRequestsCount(30);
    console.log(`   ✓ Total requests: ${totalRequests}`);

    console.log('   → Calculating avg requests per user...');
    const avgPerUser = await getAverageRequestsPerUser();
    console.log(`   ✓ Avg per user: ${avgPerUser}`);

    console.log('   → Fetching popular assistant types...');
    const popularTypes = await getPopularAssistantTypes();
    console.log(`   ✓ Found ${popularTypes.length} assistant types`);

    const response = {
      totalRequests,
      avgPerUser,
      popularTypes,
    };

    console.log('✅ Usage stats fetched successfully');
    res.json(response);
  } catch (error) {
    console.error('❌ Error in /api/admin/usage-stats:');
    console.error('   Details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      error: 'Failed to fetch usage statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Ensure UsageLog and User tables exist in database',
    });
  }
});

/**
 * GET /api/admin/recent-signups
 * Returns last 10 user signups
 */
router.get('/recent-signups', async (req, res) => {
  console.log('👥 GET /api/admin/recent-signups - Request received');
  try {
    const signups = await getRecentSignups(10);
    console.log(`👥 Found ${signups.length} recent signups`);
    res.json(signups);
  } catch (error) {
    console.error('❌ Error fetching recent signups:', error);
    res.status(500).json({
      error: 'Failed to fetch recent signups',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/admin/recent-usage
 * Returns last 10 usage logs with user info
 */
router.get('/recent-usage', async (req, res) => {
  console.log('🔄 GET /api/admin/recent-usage - Request received');
  try {
    const usage = await getRecentUsage(10);
    console.log(`🔄 Found ${usage.length} recent usage logs`);
    res.json(usage);
  } catch (error) {
    console.error('❌ Error fetching recent usage:', error);
    res.status(500).json({
      error: 'Failed to fetch recent usage',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/admin/metrics
 * Returns churn rate and conversion rate
 */
router.get('/metrics', async (req, res) => {
  console.log('📊 GET /api/admin/metrics - Request received');
  try {
    console.log('   → Calculating churn rate...');
    const churnRate = await getChurnRate();
    console.log(`   ✓ Churn rate: ${churnRate}%`);

    console.log('   → Calculating conversion rate...');
    const conversionRate = await getConversionRate();
    console.log(`   ✓ Conversion rate: ${conversionRate}%`);

    const response = {
      churnRate,
      conversionRate,
    };

    console.log('✅ Metrics fetched successfully');
    res.json(response);
  } catch (error) {
    console.error('❌ Error in /api/admin/metrics:');
    console.error('   Details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      error: 'Failed to fetch metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Ensure Session, Event, and Subscription tables exist',
    });
  }
});

/**
 * GET /api/admin/users
 * Returns paginated user list with optional search
 * Query params: search (string), page (number), limit (number)
 */
router.get('/users', async (req, res) => {
  console.log('👤 GET /api/admin/users - Request received');
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    console.log(`   → Query params: search="${search}", page=${page}, limit=${limit}`);
    console.log('   → Fetching users from database...');
    const result = await getAllUsers({ search, page, limit });
    console.log(`   ✓ Found ${result.users.length} users on page ${page} (total: ${result.total})`);
    console.log(`   ✓ Total pages: ${result.totalPages}`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/admin/users:');
    console.error('   Details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Ensure User table exists in database',
    });
  }
});

/**
 * GET /api/admin/usage-by-ip
 * Returns usage statistics grouped by IP address
 */
router.get('/usage-by-ip', async (req, res) => {
  console.log('🌐 GET /api/admin/usage-by-ip - Request received');
  try {
    const usageByIP = await prisma.$queryRaw<Array<{
      ipAddress: string | null;
      totalRequests: bigint;
      totalCost: number;
      lastSeen: Date | null;
      country: string | null;
      city: string | null;
    }>>`
      SELECT
        s."ipAddress",
        COUNT(u.id)::bigint as "totalRequests",
        COALESCE(SUM(u."costUsd"), 0)::float as "totalCost",
        MAX(s."lastActivityAt") as "lastSeen",
        s.country,
        s.city
      FROM "Session" s
      LEFT JOIN "UsageLog" u ON s.id = u."sessionId"
      WHERE s."ipAddress" IS NOT NULL
      GROUP BY s."ipAddress", s.country, s.city
      ORDER BY "totalRequests" DESC
      LIMIT 100
    `;

    // Convert BigInt to Number for JSON serialization
    const result = usageByIP.map(row => ({
      ...row,
      totalRequests: Number(row.totalRequests),
    }));

    console.log(`🌐 Found ${result.length} unique IP addresses`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/admin/usage-by-ip:');
    console.error('   Details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      error: 'Failed to fetch usage by IP',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/admin/location-map
 * Returns session counts grouped by country and city
 */
router.get('/location-map', async (req, res) => {
  console.log('🗺️ GET /api/admin/location-map - Request received');
  try {
    const locationData = await prisma.$queryRaw<Array<{
      country: string | null;
      city: string | null;
      sessionCount: bigint;
      uniqueIPs: bigint;
    }>>`
      SELECT
        country,
        city,
        COUNT(DISTINCT id)::bigint as "sessionCount",
        COUNT(DISTINCT "ipAddress")::bigint as "uniqueIPs"
      FROM "Session"
      WHERE country IS NOT NULL
      GROUP BY country, city
      ORDER BY "sessionCount" DESC
    `;

    // Convert BigInt to Number for JSON serialization
    const result = locationData.map(row => ({
      ...row,
      sessionCount: Number(row.sessionCount),
      uniqueIPs: Number(row.uniqueIPs),
    }));

    console.log(`🗺️ Found ${result.length} unique locations`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/admin/location-map:');
    console.error('   Details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      error: 'Failed to fetch location data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/admin/browser-stats
 * Returns browser usage statistics parsed from user agents
 */
router.get('/browser-stats', async (req, res) => {
  console.log('🌐 GET /api/admin/browser-stats - Request received');
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userAgent: {
          not: null,
        },
      },
      select: {
        userAgent: true,
      },
    });

    // Simple browser detection from user agent strings
    const browserCounts: Record<string, number> = {};

    sessions.forEach(session => {
      if (!session.userAgent) return;

      const ua = session.userAgent.toLowerCase();
      let browser = 'Other';

      if (ua.includes('edg/')) {
        browser = 'Edge';
      } else if (ua.includes('chrome/') && !ua.includes('edg/')) {
        browser = 'Chrome';
      } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
        browser = 'Safari';
      } else if (ua.includes('firefox/')) {
        browser = 'Firefox';
      } else if (ua.includes('opera/') || ua.includes('opr/')) {
        browser = 'Opera';
      }

      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    // Convert to array format sorted by count
    const result = Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    console.log(`🌐 Found ${result.length} different browsers`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error in /api/admin/browser-stats:');
    console.error('   Details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      error: 'Failed to fetch browser statistics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
