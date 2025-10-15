import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }>;
}

interface AnalyticsChartsProps {
  visitsData: ChartData;
  usersData: ChartData;
  topPathsData: ChartData;
  revenueByProductData?: ChartData;
  loading?: boolean;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
    },
  },
};

// Vibrant palette (20 colors)
const vibrantPalette: string[] = [
  "#6366F1", // indigo-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
  "#EC4899", // pink-500
  "#22C55E", // green-500
  "#3B82F6", // blue-500
  "#F97316", // orange-500
  "#A855F7", // purple-500
  "#14B8A6", // teal-500
  "#EAB308", // yellow-500
  "#F43F5E", // rose-500
  "#4ADE80", // green-400
  "#60A5FA", // blue-400
  "#FB7185", // rose-400
  "#FCA5A5", // red-300
  "#34D399", // emerald-400
];

export function AnalyticsCharts({
  visitsData,
  usersData,
  topPathsData,
  revenueByProductData,
  loading = false,
}: AnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Page Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Page Views & Unique Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line
              data={{
                ...visitsData,
                datasets: visitsData.datasets.map((ds, idx) => ({
                  ...ds,
                  borderColor:
                    ds.borderColor ||
                    vibrantPalette[idx % vibrantPalette.length],
                  backgroundColor:
                    ds.backgroundColor ||
                    `${vibrantPalette[idx % vibrantPalette.length]}33`,
                })),
              }}
              options={chartOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar
              data={{
                ...usersData,
                datasets: usersData.datasets.map((ds, idx) => ({
                  ...ds,
                  backgroundColor:
                    ds.backgroundColor ||
                    `${vibrantPalette[idx % vibrantPalette.length]}CC`,
                })),
              }}
              options={chartOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Top Pages Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Pages by Views</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut
              data={{
                ...topPathsData,
                datasets: topPathsData.datasets.map((ds) => ({
                  ...ds,
                  backgroundColor:
                    (ds.backgroundColor as any) ||
                    vibrantPalette.slice(0, (ds.data || []).length),
                })),
              }}
              options={doughnutOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Product */}
      {revenueByProductData && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  ...revenueByProductData,
                  datasets: revenueByProductData.datasets.map((ds, idx) => ({
                    ...ds,
                    backgroundColor:
                      ds.backgroundColor ||
                      vibrantPalette.slice(0, (ds.data || []).length),
                  })),
                }}
                options={chartOptions}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
