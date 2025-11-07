import { useState } from 'react';
import {
  useAdminOverview,
  useRevenueBreakdown,
  useUsageStats,
  useRecentSignups,
  useRecentUsage,
  useMetrics,
  useAllUsers,
  useUsageByIP,
  useLocationMap,
  useBrowserStats,
} from '@/hooks/useAdminData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(amount);
};

// Utility function to format date
const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Utility function to format relative time
const formatRelativeTime = (date: string | Date | null) => {
  if (!date) return 'Never';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// Loading skeleton component
function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

// Overview metrics cards
function OverviewSection() {
  const { data, isLoading, error } = useAdminOverview();

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded-md">
        Error loading overview: {error.message}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? <Skeleton className="h-8 w-20" /> : data?.totalUsers.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Users (30d)</CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? <Skeleton className="h-8 w-20" /> : data?.activeUsers30d.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Unique Anonymous IPs (30d)</CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? <Skeleton className="h-8 w-20" /> : (data?.uniqueAnonymousIPs30d ?? 0).toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Monthly Recurring Revenue</CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(data?.mrr || 0)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Monthly API Costs (30d)</CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(data?.monthlyApiCosts || 0)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>New Signups (7d)</CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? <Skeleton className="h-8 w-20" /> : data?.newSignups7d.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Revenue breakdown section
function RevenueBreakdownSection() {
  const { data, isLoading, error } = useRevenueBreakdown();

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Revenue Breakdown by Tier</CardTitle>
        <CardDescription>Distribution of users and revenue across subscription tiers</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">User Count</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.tier}>
                  <TableCell className="font-medium capitalize">{item.tier}</TableCell>
                  <TableCell className="text-right">{item.userCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Usage statistics section
function UsageStatsSection() {
  const { data, isLoading, error } = useUsageStats();

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Usage Statistics (Last 30 Days)</CardTitle>
        <CardDescription>API usage and popular assistant types</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total API Requests</p>
                <p className="text-2xl font-bold">{data?.totalRequests.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Requests Per User</p>
                <p className="text-2xl font-bold">{data?.avgPerUser.toFixed(1)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Popular Assistant Types</p>
              <div className="space-y-2">
                {data?.popularTypes.map((type) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <span className="capitalize">{type.type.replace('-', ' ')}</span>
                    <Badge variant="secondary">{type.count.toLocaleString()} requests</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Recent activity section
function RecentActivitySection() {
  const { data: signups, isLoading: signupsLoading, error: signupsError } = useRecentSignups();
  const { data: usage, isLoading: usageLoading, error: usageError } = useRecentUsage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>Last 10 new users</CardDescription>
        </CardHeader>
        <CardContent>
          {signupsError ? (
            <div className="text-red-500">Error: {signupsError.message}</div>
          ) : signupsLoading ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signups?.map((signup) => (
                  <TableRow key={signup.id}>
                    <TableCell className="font-medium">{signup.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {signup.currentTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(signup.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Usage</CardTitle>
          <CardDescription>Last 10 API requests</CardDescription>
        </CardHeader>
        <CardContent>
          {usageError ? (
            <div className="text-red-500">Error: {usageError.message}</div>
          ) : usageLoading ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.user?.email || 'Anonymous'}
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {item.assistantType.replace('-', ' ')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Metrics section (churn and conversion)
function MetricsSection() {
  const { data, isLoading, error } = useMetrics();

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Churn Rate (30d)</CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? <Skeleton className="h-8 w-20" /> : `${data?.churnRate.toFixed(2)}%`}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Conversion Rate</CardDescription>
          <CardTitle className="text-3xl">
            {isLoading ? <Skeleton className="h-8 w-20" /> : `${data?.conversionRate.toFixed(2)}%`}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Usage by IP section
function UsageByIPSection() {
  const { data, isLoading, error } = useUsageByIP();

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Usage by IP Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Usage by IP Address</CardTitle>
        <CardDescription>Top 100 IP addresses by request count</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton rows={10} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Total Requests</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{item.ipAddress || '-'}</TableCell>
                  <TableCell>{item.country || '-'}</TableCell>
                  <TableCell>{item.city || '-'}</TableCell>
                  <TableCell className="text-right">{item.totalRequests.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(item.lastSeen)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Location map section
function LocationMapSection() {
  const { data, isLoading, error } = useLocationMap();

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <CardDescription>Sessions and unique visitors by location</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton rows={10} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Unique IPs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.country || '-'}</TableCell>
                  <TableCell>{item.city || '-'}</TableCell>
                  <TableCell className="text-right">{item.sessionCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.uniqueIPs.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Browser statistics section
function BrowserStatsSection() {
  const { data, isLoading, error } = useBrowserStats();

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Browser Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = data?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Browser Statistics</CardTitle>
        <CardDescription>Browser usage distribution ({totalSessions.toLocaleString()} total sessions)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton rows={5} />
        ) : (
          <div className="space-y-3">
            {data?.map((item) => {
              const percentage = totalSessions > 0 ? (item.count / totalSessions * 100) : 0;
              return (
                <div key={item.browser} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.browser}</span>
                    <span className="text-muted-foreground">
                      {item.count.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// All users table with search and pagination
function AllUsersSection() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useAllUsers(search, page, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          Searchable list of all users ({data?.total.toLocaleString() || 0} total)
        </CardDescription>
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500">Error: {error.message}</div>
        ) : isLoading ? (
          <LoadingSkeleton rows={10} />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.currentTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {user.monthlyRequestsUsed} / {user.monthlyRequestsLimit}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(user.lastActiveAt)}
                    </TableCell>
                    <TableCell className="text-sm">{user.country || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {data.page} of {data.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Main admin page component
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            TeachAssist.ai analytics and user management
          </p>
        </div>

        {/* Overview Cards */}
        <OverviewSection />

        {/* Revenue Breakdown */}
        <RevenueBreakdownSection />

        {/* Usage Statistics */}
        <UsageStatsSection />

        {/* Recent Activity */}
        <RecentActivitySection />

        {/* Key Metrics */}
        <MetricsSection />

        {/* Browser Statistics */}
        <BrowserStatsSection />

        {/* Geographic Distribution */}
        <LocationMapSection />

        {/* Usage by IP */}
        <UsageByIPSection />

        {/* All Users Table */}
        <AllUsersSection />
      </div>
    </div>
  );
}
