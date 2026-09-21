import { formatIndianNumber } from "@/utils";
import { COLORS } from "../RecommendationList/utils";

const TacticalProgressBar = ({
  stock,
  blurStyle,
}: {
  stock: StockData;
  blurStyle?: React.CSSProperties;
}) => {
  console.log({ tac: stock });
  const entry = Number(stock.entryPrice ?? 0);
  const cmp = Number(stock.cmp ?? 0);
  const stopLoss = Number(stock.stopLoss ?? 0);

  if (!entry || !cmp || !stopLoss) {
    return null;
  }

  const isProfit = cmp >= entry;

  const min = stopLoss;
  const max = isProfit ? cmp : entry;
  const range = max - min || 1;

  const pos = (value: number) => ((value - min) / range) * 100;

  const slPos = 0;
  const entryPos = pos(entry);
  const cmpPos = pos(cmp);

  const segmentLeft = isProfit ? entryPos : cmpPos;
  const segmentRight = isProfit ? cmpPos : entryPos;
  const segmentWidth = Math.max(segmentRight - segmentLeft, 2);

  return (
    <div className="p-4 mx-4 mb-4 rounded-lg border">
      <div className="mb-3 relative" style={{ paddingTop: "20px" }}>
        <div className="relative w-full h-4 bg-gray-300 rounded-full flex items-center">
          <div
            className="h-4 rounded-full absolute"
            style={{
              left: `${segmentLeft}%`,
              width: `${segmentWidth}%`,
              backgroundColor: isProfit ? COLORS.darkGreen : COLORS.red,
            }}
          ></div>

          <div className="absolute top-5 left-0 flex flex-col text-xs text-gray-500">
            <span className="flex flex-col items-center justify-center">
              <span style={blurStyle}>₹{formatIndianNumber(stopLoss)}</span>
              <span>Stop Loss</span>
            </span>
          </div>

          <div
            className="absolute -top-7 text-xs font-semibold text-gray-700"
            style={{
              left: `${entryPos}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="flex flex-col items-center justify-center">
              <span>Entry</span>
              <span style={blurStyle}>₹{formatIndianNumber(entry)}</span>
            </span>
          </div>

          <div
            className={`absolute top-5 text-xs ${
              isProfit ? "text-green-700" : "text-red-700"
            }`}
            style={{
              left: `${cmpPos}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="flex flex-col items-center justify-center">
              <span>CMP</span>
              <span style={blurStyle}>₹{formatIndianNumber(cmp)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalProgressBar;
