import { COLORS } from "./utils";


function getFormattedLastUpdated(lastUpdated?: string) {
    if (!lastUpdated) return <>Last Updated On: -</>;
    const lastUpdatedDate = new Date(lastUpdated);
    if (isNaN(lastUpdatedDate.getTime())) return <>Last Updated On: -</>;
    const day = lastUpdatedDate.getDate().toString().padStart(2, "0");
    const month = lastUpdatedDate.toLocaleString("en-US", { month: "short" });
    const year = lastUpdatedDate.getFullYear();
    return <>Last Updated On: {day} {month} {year}</>;
  }
  
  // Separated header for clarity
const StockCardHeader= ({
    stock,
    blurStyle,
  }: {
    stock: StockData;
    blurStyle?: React.CSSProperties;
  }) =>{
    return (
      <div
        className="flex items-center p-4"
        style={{
          borderBottom: `1px solid ${COLORS.red}`,
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        {stock.logo ? (
          <img
            src={stock.logo}
            style={blurStyle}
            alt={stock.name}
            className="w-16 h-16 object-contain rounded-md"
          />
        ) : (
          <div
            className="w-16 h-16 flex items-center justify-center rounded-md text-xs font-semibold"
            style={{
              background: "#f3f4f6",
              border: `1px solid ${COLORS.lightGray}`,
            }}
          >
            LOGO
          </div>
        )}
  
        <div className="ml-4 flex-1 text-gray-900">
          <h3
            className="font-semibold text-base leading-tight"
            style={blurStyle}
          >
            {stock.name}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {stock.sector} <span className="text-gray-400">|</span> MCAP:
            <span className="text-gray-800"> {stock.marketCap}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getFormattedLastUpdated(stock.lastUpdated)}
          </p>
        </div>
      </div>
    );
  }

  export default StockCardHeader