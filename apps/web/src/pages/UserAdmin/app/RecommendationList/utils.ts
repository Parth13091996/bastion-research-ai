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
  exited: "#9ca3af",
  grayDark: "#41444e",
};

// Helper functions for colors (shared across components)
export const getBandColor = (band: string) => {
  switch (band) {
    case "BUY":
      return COLORS.green;
    case "HOLD":
      return COLORS.gold;
    case "EXITED":
      return COLORS.exited;
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
      return "#494949"; // Dark Gray
    default:
      return "#FFFFFF";
  }
};
