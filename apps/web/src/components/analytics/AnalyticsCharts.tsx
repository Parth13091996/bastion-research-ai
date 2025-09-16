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

export function AnalyticsCharts({
  visitsData,
  usersData,
  topPathsData,
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
            <Line data={visitsData} options={chartOptions} />
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
            <Bar data={usersData} options={chartOptions} />
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
            <Doughnut data={topPathsData} options={doughnutOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}