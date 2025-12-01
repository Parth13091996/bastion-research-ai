import { getRecommendationByCompanySymbol } from "@/api/recommendations-apis";
import { useIsMobile } from "@/hooks/use-mobile";
import useSheetStocks from "@/hooks/use-sheets-stocks";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnnouncementsUpdates from "./AnnouncementsUpdates";
import Header from "./Header";
import ResourcesQuarterly from "./ResourcesQuarterly";
import StockNavChart from "./StockNavChart";
import UpdateModal from "./UpdateModal";
import {
  fetchSingleRecommendationGraphSheetData,
  formatMonthYear,
  getFilteredData,
  type PBRow,
} from "./utils";

const SingleRecommendation = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("ALL");
  const { stocks, loading } = useSheetStocks(true);
  const [externalRows, setExternalRows] = useState<PBRow[] | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!symbol) {
      setFetchError("Invalid recommendation symbol.");
      return;
    }

    setFetchError(null);

    getRecommendationByCompanySymbol(symbol)
      .then((response) => {
        const foundStock =
          Array.isArray(stocks) && stocks.length > 0
            ? stocks.find((r: any) => r && r.code === symbol)
            : null;
        setStock({ ...(response || {}), ...(foundStock || {}) });
      })
      .catch((error) => {
        setFetchError("Failed to fetch recommendation.");
        setStock(null);
      });
  }, [symbol, stocks]);

  useEffect(() => {
    let cancelled = false;
    if (stock && stock?.stock_performance_url) {
      fetchSingleRecommendationGraphSheetData(
        stock.stock_performance_url as string
      )
        .then((rows) => {
          if (!cancelled) setExternalRows(rows);
        })
        .catch(() => {
          if (!cancelled) setExternalRows(null);
        });
    } else {
      setExternalRows(null);
    }
    return () => {
      cancelled = true;
    };
  }, [stock?.nseSymbol, stock?.name, stock?.stock_performance_url]);

  const announcements = Array.isArray(stock?.announcements_and_update)
    ? stock.announcements_and_update.map((item: any, idx: number) => ({
        id: idx,
        date: formatMonthYear(item?.date ?? ""),
        heading: item?.title ?? "",
        preview: item?.description ?? "",
        hasPdf: !!item?.pdf_url,
        pdf_url: item?.pdf_url ?? "",
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : fetchError ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-lg">
            Error: {fetchError || "Unknown error"}
          </div>
        </div>
      ) : (
        <>
          <Header stock={stock} />
          <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StockNavChart
                stock={stock}
                isMobile={!!isMobile}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                data={getFilteredData(externalRows, timeRange)}
              />
              <ResourcesQuarterly
                stock={stock}
                setSelectedUpdate={setSelectedUpdate}
              />
            </div>

            <AnnouncementsUpdates
              announcements={announcements}
              setSelectedUpdate={setSelectedUpdate}
            />
          </main>

          <UpdateModal
            selectedUpdate={selectedUpdate}
            setSelectedUpdate={setSelectedUpdate}
          />
        </>
      )}
    </div>
  );
};

export default SingleRecommendation;
