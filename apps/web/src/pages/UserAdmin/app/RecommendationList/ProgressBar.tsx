import { formatIndianNumber } from "@/utils";
import { COLORS, isExited } from "./utils";

// Modified ProgressBar to remove target price for EXITED stocks
const ProgressBar = ({
  stock,
  gainPercent,
  lossPercent,
  blurStyle,
  currentPrice,
  priceLabel = "CMP",
}: {
  stock: StockData;
  gainPercent: number;
  lossPercent: number;
  blurStyle?: React.CSSProperties;
  currentPrice?: number;
  priceLabel?: string;
}) => {
  const exited = isExited(stock);
  const displayPrice = currentPrice ?? Number(stock.cmp ?? 0);

  // If Target1 is missing or zero, use the actual percent return to scale the green bar
  // (Assuming we want to treat 100% gain as a full bar when there is no target price)
  let effectiveGainPercent = gainPercent;
  const target1 = Number(stock.target1 ?? 0);
  if (!target1 || target1 <= Number(stock.entryPrice ?? 0)) {
    const profitPoints = displayPrice - Number(stock.entryPrice ?? 0);
    const relativePercentGain = (profitPoints / Number(stock.entryPrice ?? 0)) * 100;
    effectiveGainPercent = Math.min(Math.max(relativePercentGain, 15), 100); // cap between 15% and 100%
  }

  return (
    <div className="p-4 mx-4 mb-4 rounded-lg border">
      <div
        className="mb-3 relative"
        style={{ paddingTop: "20px", paddingBottom: "20px" }}
      >
        <div className="relative w-full h-4 bg-gray-300 rounded-full flex items-center">
          {/* CMP > ENTRY */}
          {displayPrice >= Number(stock.entryPrice ?? 0) && (
            <>
              <div
                className="h-4 rounded-full rounded-r-lg transition-all duration-500 absolute"
                style={{
                  width: `${effectiveGainPercent}%`,
                  backgroundColor: COLORS.darkGreen,
                  left: 0,
                }}
              ></div>
              {/* Entry Price (left) */}
              <div className="absolute top-6 left-0 flex flex-col text-xs text-gray-500">
                <span className="flex flex-col items-center justify-center">
                  <span style={blurStyle}>
                    ₹{formatIndianNumber(Number(stock.entryPrice ?? 0))}
                  </span>
                  <span>Entry Price</span>
                </span>
              </div>
              {/* CMP / Exit Price on bar */}
              <div
                className="absolute -top-8 text-xs font-semibold text-green-700"
                style={{
                  left: `${effectiveGainPercent}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <span className="flex flex-col items-center justify-center">
                  <span>{priceLabel}</span>
                  <span style={blurStyle}>
                    ₹{formatIndianNumber(displayPrice)}
                  </span>
                </span>
              </div>
              {/* Target Price (right) - REMOVED for exited stocks */}
              {!exited && (
                <div className="absolute top-6 right-0 flex flex-col text-xs text-gray-500">
                  <span className="flex flex-col items-center justify-center">
                    <span style={blurStyle}>
                      ₹{formatIndianNumber(Number(stock.target1 ?? 0))}
                    </span>
                    <span>Target Price</span>
                  </span>
                </div>
              )}
            </>
          )}
          {/* CMP < ENTRY */}
          {displayPrice < Number(stock.entryPrice ?? 0) && (
            <>
              <div
                className="h-4 rounded-l-full rounded-r-none transition-all duration-500 absolute"
                style={{
                  width: `${lossPercent}%`,
                  backgroundColor: COLORS.red,
                  left: 0,
                }}
              ></div>
              {/* CMP / Exit Price at start of red bar */}
              <div
                className="absolute -top-8 text-xs font-semibold text-red-700"
                style={{
                  left: "0%",
                  transform: "translateX(0)",
                }}
              >
                <span className="flex flex-col items-center justify-center">
                  <span>{priceLabel}</span>
                  <span style={blurStyle}>
                    ₹{formatIndianNumber(displayPrice)}
                  </span>
                </span>
              </div>
              {/* Entry Price at end of red bar */}
              <div
                className="absolute top-6 text-xs text-gray-500"
                style={{
                  left: `${lossPercent}%`,
                  transform: "translateX(-60%)",
                }}
              >
                <span className="flex flex-col items-center justify-center">
                  <span style={blurStyle}>
                    ₹{formatIndianNumber(Number(stock.entryPrice ?? 0))}
                  </span>
                  <span>Entry Price</span>
                </span>
              </div>
              {/* Target Price fixed right - REMOVED for exited stocks */}
              {!exited && (
                <div className="absolute top-6 right-0 flex flex-col text-xs text-gray-500">
                  <span className="flex flex-col items-center justify-center">
                    <span style={blurStyle}>
                      ₹{formatIndianNumber(Number(stock.target1 ?? 0))}
                    </span>
                    <span>Target Price</span>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar