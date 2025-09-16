import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { AnalyticsCard } from "./AnalyticsCard";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { fetchAnalyticsSummary } from "@/api/analytics";
import {
  Users,
  Eye,
  Activity,
  TrendingUp,
  Globe,
  Clock,
  RefreshCw,
  Calendar,
  BarChart3,
} from "lucide-react";
import { ColDef } from "ag-grid-community";

interface PageViewRow {
  path: string;
  views: number;
  uniqueIPs: number;
  uniqueUsers: number;
  avgTimeOnPage?: string;
  bounceRate?: string;
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState(7);
  
  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["analytics-summary", timeRange],
    queryFn: () => fetchAnalyticsSummary(timeRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  // Transform data for charts
  const visitsData = {
    labels: summary?.visitsByDay.map(v => 
      new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: "Page Views",
        data: summary?.visitsByDay.map(v => v.totalViews) || [],
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Unique Visitors",
        data: summary?.visitsByDay.map(v => v.uniqueIPs) || [],
        borderColor: "hsl(var(--secondary))",
        backgroundColor: "hsl(var(--secondary) / 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const usersData = {
    labels: summary?.usersByDay.map(v => 
      new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: "Active Users",
        data: summary?.usersByDay.map(v => v.uniqueUsers) || [],
        backgroundColor: "hsl(var(--primary) / 0.8)",
        borderRadius: 8,
      },
    ],
  };

  const topPathsData = {
    labels: summary?.topPaths.slice(0, 8).map(p => p.path) || [],
    datasets: [
      {
        label: "Page Views",
        data: summary?.topPaths.slice(0, 8).map(p => p.views) || [],
        backgroundColor: [
          "hsl(var(--primary))",
          "hsl(var(--secondary))",
          "hsl(var(--accent))",
          "hsl(var(--muted-foreground))",
          "hsl(var(--destructive))",
          "hsl(var(--primary) / 0.7)",
          "hsl(var(--secondary) / 0.7)",
          "hsl(var(--accent) / 0.7)",
        ],
      },
    ],
  };

  // Table columns for detailed page analytics
  const pageColumns: ColDef<PageViewRow>[] = [
    {
      headerName: "Page",
      field: "path",
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex items-center">
          <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{params.value}</span>
        </div>
      ),
    },
    {
      headerName: "Views",
      field: "views",
      width: 100,
      cellRenderer: (params: any) => (
        <Badge variant="secondary">{params.value.toLocaleString()}</Badge>
      ),
    },
    {
      headerName: "Unique Visitors",
      field: "uniqueIPs",
      width: 120,
    },
    {
      headerName: "Unique Users",
      field: "uniqueUsers",
      width: 120,
    },
  ];

  const totalViews = summary?.visitsByDay.reduce((sum, day) => sum + day.totalViews, 0) || 0;
  const totalUniqueIPs = summary?.totals?.uniqueIPs || 0;
  const totalUniqueUsers = summary?.totals?.uniqueUsers || 0;
  const activeNow = summary?.activeNow || { ips: 0, users: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <BarChart3 className="mr-3 h-8 w-8" />
            Website Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your website performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-2 border border-input rounded-md text-sm bg-background"
            >
              <option value={1}>Today</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Page Views"
          value={totalViews.toLocaleString()}
          description={`Last ${timeRange} days`}
          icon={Eye}
        />
        <AnalyticsCard
          title="Unique Visitors"
          value={totalUniqueIPs.toLocaleString()}
          description="Unique IP addresses"
          icon={Users}
        />
        <AnalyticsCard
          title="Registered Users"
          value={totalUniqueUsers.toLocaleString()}
          description="Logged in users"
          icon={Users}
        />
        <AnalyticsCard
          title="Active Now"
          value={`${activeNow.ips} / ${activeNow.users}`}
          description="Visitors / Users online"
          icon={Activity}
        />
      </div>

      {/* Charts */}
      {error ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive font-medium">Failed to load analytics</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AnalyticsCharts
          visitsData={visitsData}
          usersData={usersData}
          topPathsData={topPathsData}
          loading={isLoading}
        />
      )}

      {/* Detailed Page Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Page Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={summary?.topPaths || []}
            columns={pageColumns}
            loading={isLoading}
            searchPlaceholder="Search pages..."
            enableExport={true}
            className="border-0"
          />
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.topPaths.slice(0, 5).map((path, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-mono">{path.path}</span>
                  </div>
                  <Badge variant="outline">{path.views} views</Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Views per Day</span>
                <span className="font-medium">
                  {Math.round(totalViews / timeRange).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Top Page</span>
                <span className="font-medium text-sm">
                  {summary?.topPaths[0]?.path || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Pages Tracked</span>
                <span className="font-medium">{summary?.topPaths.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}