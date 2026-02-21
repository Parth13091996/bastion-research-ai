export const COLORS = {
  red: "#C00000",
  deepBlue: "#1C2852",
  beige: "#C4B696",
  lightGray: "#E6E6E6",
  white: "#FFFFFF",
  gray: "#f8f9fa",
  teal: "#0d9488",
  orange: "#f59e0b",
  green: "#d1f1d9",
  darkGreen: "#059669",
  gold: "#fef2c3",
  exited: "#C00000",
  lightRed: "#ffc8c8",
};

// Helper functions for colors (shared across components)
export const getBandColor = (band: string) => {
  switch (band) {
    case "BUY":
      return COLORS.green;
    case "HOLD":
      return COLORS.gold;
    case "EXIT":
      return COLORS.lightRed;
    default:
      return COLORS.lightGray;
  }
};

export const getTextColor = (band: string) => {
  switch (band) {
    case "BUY":
      return "#059669"; // Dark Green
    case "HOLD":
      return "#b8860b"; // Dark Gold
    case "EXIT":
      return "#C00000"; // Dark red
    default:
      return "#FFFFFF";
  }
};

// Utility functions
export function getBlurStyle(isPaid: boolean) {
  return isPaid
    ? ({
        filter: "blur(7px)",
        userSelect: "none",
        pointerEvents: "none",
      } as React.CSSProperties)
    : undefined;
}

export function getGainPercent(
  cmp: number,
  entryPrice: number,
  target1?: number
) {
  // If target1 is missing or 0, or less than entry price, use a fixed visual representation (e.g. 50%)
  if (!target1 || target1 <= entryPrice) {
    // If it's pure profit with no known target, we can place the pin at 50% visually,
    // or we can calculate a different scale. Since we just want it to "show the difference
    // in the bar", pinning it at 50% allows the pin to be in the middle of the green bar.
    return 50; 
  }
  let rawGainPercent = ((cmp - entryPrice) / (target1 - entryPrice)) * 100;
  if (rawGainPercent < 0) rawGainPercent = 1;
  return Math.abs(Math.min(rawGainPercent, 100));
}

export function getLossPercent(cmp: number, entryPrice: number) {
  let rawLossPercent = ((entryPrice - cmp) / entryPrice) * 100;
  if (rawLossPercent < 0) rawLossPercent = 1;
  return Math.min(rawLossPercent, 100);
}

// Helper to determine if a stock is EXited
export function isExited(stock: StockData) {
  return (stock.band || "").toUpperCase() === "EXIT";
}

export function getProfitOrLossPercent(stock: StockData) {
  // (cmp - entry)/entry * 100
  const cmp = Number(stock.cmp ?? 0);
  const entry = Number(stock.entryPrice ?? 0);
  if (!entry) return 0;
  const pnl = ((cmp - entry) / entry) * 100;
  return Math.round(pnl * 100) / 100; // round to 2 decimal places
}
