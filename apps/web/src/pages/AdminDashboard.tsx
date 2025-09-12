import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart, Activity } from "lucide-react";
import "chart.js/auto";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { fetchAnalyticsSummary, type AnalyticsSummary } from "@/api/analytics";

const AdminDashboard = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   let mounted = true;
  //   (async () => {
  //     try {
  //       const data = await fetchAnalyticsSummary(7);
  //       if (mounted) setSummary(data);
  //     } catch (e: any) {
  //       if (mounted) setError('Failed to load analytics');
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   })();
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  const visitsLineData = useMemo(() => {
    const labels = summary?.visitsByDay.map((v) => v.date) ?? [];
    return {
      labels,
      datasets: [
        {
          label: "Total Views",
          data: summary?.visitsByDay.map((v) => v.totalViews) ?? [],
          borderColor: "rgba(59,130,246,0.9)",
          backgroundColor: "rgba(59,130,246,0.2)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Unique IPs",
          data: summary?.visitsByDay.map((v) => v.uniqueIPs) ?? [],
          borderColor: "rgba(16,185,129,0.9)",
          backgroundColor: "rgba(16,185,129,0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [summary]);

  const usersBarData = useMemo(() => {
    const labels = summary?.usersByDay.map((v) => v.date) ?? [];
    return {
      labels,
      datasets: [
        {
          label: "Unique Users",
          data: summary?.usersByDay.map((v) => v.uniqueUsers) ?? [],
          backgroundColor: "rgba(99,102,241,0.7)",
          borderRadius: 6,
        },
      ],
    };
  }, [summary]);

  const topPathsData = useMemo(() => {
    const top = summary?.topPaths ?? [];
    const labels = top.map((t) => t.path);
    const data = top.map((t) => t.views);
    return {
      labels,
      datasets: [
        {
          label: "Views",
          data,
          backgroundColor: [
            "#60a5fa",
            "#34d399",
            "#fbbf24",
            "#f472b6",
            "#a78bfa",
            "#f87171",
            "#2dd4bf",
            "#c084fc",
            "#22c55e",
            "#f59e0b",
          ],
        },
      ],
    };
  }, [summary]);

  const activeNow = summary?.activeNow || { ips: 0, users: 0 };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Analytics Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active IPs Now
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNow.ips}</div>
            <p className="text-xs text-muted-foreground">last 5 minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users Now
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNow.users}</div>
            <p className="text-xs text-muted-foreground">last 5 minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Views (7d)
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.visitsByDay.reduce((a, b) => a + b.totalViews, 0) ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              unique IPs: {summary?.totals?.uniqueIPs ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Users (7d)
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totals?.uniqueUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">unique across range</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Views vs Unique IPs (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <Line
                data={visitsLineData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" as const } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unique Users per Day</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <Bar
                data={usersBarData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Pages (by views)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <div className="max-w-xl mx-auto">
                <Doughnut data={topPathsData} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
