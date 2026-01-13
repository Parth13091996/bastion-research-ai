import { getRecommendationByCompanySymbol } from "@/api/recommendations-apis";
import dayjs from "dayjs"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SingleRecommendation = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("ALL");
  const { stocks, loading } = useSheetStocks(true);
  const [externalRows, setExternalRows] = useState<PBRow[] | null>(null);
  const [selectedPerformanceIndex, setSelectedPerformanceIndex] =
    useState<number>(0);
  const isMobile = useIsMobile();

  const performanceArray =
    Array.isArray(stock?.stock_performance_url) && stock.stock_performance_url
      ? stock.stock_performance_url
      : stock?.stock_performance_url
        ? [
            {
              date: stock.dateRecommended || "",
              title: "Initial recommendation",
              stock_recommendation_url: stock.stock_performance_url,
            },
          ]
        : [];

  const selectedPerformanceItem =
    performanceArray.length > 0
      ? performanceArray[
          Math.min(selectedPerformanceIndex, performanceArray.length - 1)
        ]
      : null;

  const effectiveStock =
    stock && typeof stock === "object"
      ? {
          ...stock,
          business_note:
            selectedPerformanceItem?.business_note ?? stock.business_note,
          quick_bite: selectedPerformanceItem?.quick_bite ?? stock.quick_bite,
          video: selectedPerformanceItem?.video ?? stock.video,
          exit_rationale:
            selectedPerformanceItem?.exit_rationale ?? stock.exit_rationale,
          quarterly_update:
            selectedPerformanceItem?.quarterly_update ?? stock.quarterly_update,
          announcements_and_update:
            selectedPerformanceItem?.announcements_and_update ??
            stock.announcements_and_update,
          dateRecommended:
            selectedPerformanceItem?.dateRecommended ?? stock.dateRecommended,
          priceAtRecommendation:
            selectedPerformanceItem?.priceAtRecommendation ??
            stock.priceAtRecommendation,
          dateExit:
            selectedPerformanceItem?.dateExit ?? stock.dateExit ?? "",
          holdingPeriod:
            selectedPerformanceItem?.holdingPeriod ?? stock.holdingPeriod,
          cmpOrExitPrice:
            selectedPerformanceItem?.cmpOrExitPrice ?? stock.cmpOrExitPrice,
          percentReturn:
            selectedPerformanceItem?.percentReturn ?? stock.percentReturn,
          action: selectedPerformanceItem?.action ?? stock.action,
          targetPrice:
            selectedPerformanceItem?.targetPrice ?? stock.targetPrice,
          upsidePotential:
            selectedPerformanceItem?.upsidePotential ?? stock.upsidePotential,
          latestMcapCr:
            selectedPerformanceItem?.latestMcapCr ?? stock.latestMcapCr,
        }
      : stock;


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
        // Reset selected performance index when stock changes
        setSelectedPerformanceIndex(0);
      })
      .catch(() => {
        setFetchError("Failed to fetch recommendation.");
        setStock(null);
      });
  }, [symbol, stocks]);

  useEffect(() => {
    let cancelled = false;
    const currentItem =
      performanceArray.length > 0
        ? performanceArray[
            Math.min(selectedPerformanceIndex, performanceArray.length - 1)
          ]
        : null;

    if (currentItem && currentItem.stock_recommendation_url) {
      fetchSingleRecommendationGraphSheetData(
        currentItem.stock_recommendation_url as string
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
  }, [
    stock?.nseSymbol,
    stock?.name,
    stock?.stock_performance_url,
    selectedPerformanceIndex,
  ]);

  const announcements = Array.isArray(
    effectiveStock?.announcements_and_update
  )
    ? effectiveStock.announcements_and_update.map((item: any, idx: number) => ({
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
          <Header stock={stock} selectedPerformanceIndex={selectedPerformanceIndex}/>
          <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {/* Performance URL selector */}
                {Array.isArray(performanceArray) &&
                  performanceArray.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        Select Performance Date
                      </label>
                      <div className="flex flex-col gap-1">
                        <Select
                          value={String(selectedPerformanceIndex)}
                          onValueChange={(v) =>
                            setSelectedPerformanceIndex(parseInt(v, 10))
                          }
                        >
                          <SelectTrigger className="w-full max-w-xs">
                            <SelectValue placeholder="Select date" />
                          </SelectTrigger>
                          <SelectContent>
                            {performanceArray.map(
                              (item: any, index: number) => (
                                <SelectItem key={index} value={String(index)}>
                                  {dayjs(item.date).format("DD MMM YYYY") || "Unknown date"}{" "}
                                  {item.title ? `- ${item.title}` : ""}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                <StockNavChart
                  stock={stock}
                  isMobile={!!isMobile}
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  data={getFilteredData(externalRows, timeRange)}
                />
              </div>
              <ResourcesQuarterly
                stock={effectiveStock}
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
