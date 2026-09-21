import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
  } from "recharts";
  

  
  // Separated Chart component, with null checks
const StockNavChart=({
    data,
    timeRange,
    setTimeRange,
    isMobile,
    stock,
  }: {
    data: Array<{
      date: string;
      "Stock NAV": number | null;
      "Index NAV": number | null;
      Action: number | null;
      actualDate: string;
    }> | null;
    timeRange: string;
    setTimeRange: (range: string) => void;
    isMobile: boolean;
    stock: any;
  }) =>{
    if (!Array.isArray(data)) return null;
  
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Index NAV, Stock NAV
            </h2>
            {/* <p className="text-sm text-gray-500">Since Jan 2024</p> */}
          </div>
          <div className="flex gap-2">
            {["1M", "3M", "1Y", "ALL"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs rounded-full border shadow-sm ${
                  timeRange === range
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className={isMobile ? "overflow-x-auto" : "overflow-hidden"}>
          <LineChart width={550} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" yAxisId="left" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: any, name: string) => {
                if (name === "Action") {
                  if (value === 1) return ["BUY", "Action"];
                  if (value === 0) return ["HOLD", "Action"];
                  if (value === -1) return ["SELL", "Action"];
                  return [value, "Action"];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Stock NAV"
              stroke="#2563eb"
              strokeWidth={1}
              name={`${stock?.name || stock?.nseSymbol || "Stock"} NAV`}
              dot={false}
              yAxisId="left"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="Index NAV"
              stroke="#10b981"
              strokeWidth={1}
              name="Index NAV"
              dot={false}
              yAxisId="left"
              connectNulls
            />
          </LineChart>
        </div>
      </div>
    );
  }

  export default StockNavChart
