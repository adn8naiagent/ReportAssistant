import { useQuery } from '@tanstack/react-query';

interface OverviewData {
  totalUsers: number;
  activeUsers30d: number;
  mrr: number;
  newSignups7d: number;
}

interface RevenueBreakdownItem {
  tier: string;
  userCount: number;
  revenue: number;
  percentage: number;
}

interface UsageStats {
  totalRequests: number;
  avgPerUser: number;
  popularTypes: Array<{ type: string; count: number }>;
}

interface RecentSignup {
  id: string;
  email: string;
  name: string | null;
  currentTier: string;
  createdAt: string;
  country: string | null;
}

interface RecentUsageItem {
  id: string;
  assistantType: string;
  requestType: string;
  createdAt: string;
  wasSuccessful: boolean;
  user: {
    email: string;
    name: string | null;
  } | null;
}

interface Metrics {
  churnRate: number;
  conversionRate: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  currentTier: string;
  monthlyRequestsUsed: number;
  monthlyRequestsLimit: number;
  lastActiveAt: Date | null;
  createdAt: Date;
  country: string | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE = '/api/admin';

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Hook to fetch admin overview metrics
 */
export function useAdminOverview() {
  return useQuery<OverviewData>({
    queryKey: ['admin', 'overview'],
    queryFn: () => fetchJson<OverviewData>('/overview'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch revenue breakdown by tier
 */
export function useRevenueBreakdown() {
  return useQuery<RevenueBreakdownItem[]>({
    queryKey: ['admin', 'revenue-breakdown'],
    queryFn: () => fetchJson<RevenueBreakdownItem[]>('/revenue-breakdown'),
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch usage statistics
 */
export function useUsageStats() {
  return useQuery<UsageStats>({
    queryKey: ['admin', 'usage-stats'],
    queryFn: () => fetchJson<UsageStats>('/usage-stats'),
    refetchInterval: 30000,
  });
}

/**
 * Hook to fetch recent signups
 */
export function useRecentSignups() {
  return useQuery<RecentSignup[]>({
    queryKey: ['admin', 'recent-signups'],
    queryFn: () => fetchJson<RecentSignup[]>('/recent-signups'),
    refetchInterval: 30000,
  });
}

/**
 * Hook to fetch recent usage
 */
export function useRecentUsage() {
  return useQuery<RecentUsageItem[]>({
    queryKey: ['admin', 'recent-usage'],
    queryFn: () => fetchJson<RecentUsageItem[]>('/recent-usage'),
    refetchInterval: 30000,
  });
}

/**
 * Hook to fetch churn and conversion metrics
 */
export function useMetrics() {
  return useQuery<Metrics>({
    queryKey: ['admin', 'metrics'],
    queryFn: () => fetchJson<Metrics>('/metrics'),
    refetchInterval: 60000,
  });
}

/**
 * Hook to fetch all users with pagination and search
 */
export function useAllUsers(search: string = '', page: number = 1, limit: number = 20) {
  return useQuery<UsersResponse>({
    queryKey: ['admin', 'users', search, page, limit],
    queryFn: () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });
      return fetchJson<UsersResponse>(`/users?${params.toString()}`);
    },
    refetchInterval: 30000,
  });
}

/**
 * Hook to fetch all recent activity (signups + usage)
 */
export function useRecentActivity() {
  const signups = useRecentSignups();
  const usage = useRecentUsage();

  return {
    signups: {
      data: signups.data,
      isLoading: signups.isLoading,
      error: signups.error,
    },
    usage: {
      data: usage.data,
      isLoading: usage.isLoading,
      error: usage.error,
    },
  };
}
