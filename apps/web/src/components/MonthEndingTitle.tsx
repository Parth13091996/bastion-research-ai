const MonthEndingTitle = ({ format = "MMM'yy" }) => {
  const today = new Date();
  const reference = new Date(today.getFullYear(), today.getMonth(), 10);

  let showDate;
  if (today >= reference) {
    showDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  } else {
    showDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  }

  const month = showDate.toLocaleString("en-US", { month: "short" }); // Nov
  const yearFull = showDate.getFullYear(); // 2025
  const yearShort = String(yearFull).slice(2); // 25

  // simple manual formatting
  const formatted = format
    .replace("MMM", month)
    .replace("yyyy", yearFull)
    .replace("yy", yearShort)
    .replace("’", "'");

  return formatted;
};
export default MonthEndingTitle;