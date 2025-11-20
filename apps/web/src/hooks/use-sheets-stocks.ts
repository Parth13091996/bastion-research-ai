import {
  getAllRecommendations,
  getSheetRecommendations,
} from "@/api/recommendations-apis";
import { useRecommendationsStore } from "@/stores/recommendations-store";
import { useEffect, useState } from "react";

const useSheetStocks = (
  onlySheet: boolean = false,
  forceRefresh: boolean = false
) => {
  const store = useRecommendationsStore();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (
        !forceRefresh &&
        !store.shouldRefetch() &&
        (store.stocks.length > 0 ||
          store.sheetStocks.length > 0 ||
          store.dbData.length > 0)
      ) {
        return;
      }

      setLocalLoading(true);
      store.setLoading(true);
      store.setError(null);

      try {
        const sheetData = await getSheetRecommendations();
        const transformedSheetStocks: StockData[] = sheetData.map(
          (sheetRow, idx) => ({
            id: `${idx}-${sheetRow.nseSymbol || sheetRow.companyName}`,
            name: sheetRow.companyName,
            code: sheetRow.nseSymbol || "",
            marketCap: sheetRow.latestMcapCr
              ? `₹ ${Math.round(
                  parseFloat(String(sheetRow.latestMcapCr))
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} Cr.`
              : "₹ 0.00 Cr.",
            upside: Math.round(
              (sheetRow.upsidePotential || 0) * 100
            ).toString(),
            cmp: Math.round(sheetRow.cmpOrExitPrice || 0),
            entryPrice: Math.round(sheetRow.priceAtRecommendation || 0),
            target1: Math.round(sheetRow.targetPrice || 0),
            sector: (sheetRow as any).sector || "",
            band: (sheetRow.action?.toUpperCase() as any) || "BUY",
            lastUpdated: (sheetRow.dateRecommended || "").toString(),
            percentReturn: Math.round((sheetRow.percentReturn || 0) * 100),
          })
        );
        store.setSheetStocks(transformedSheetStocks);

        if (onlySheet) {
          store.setStocks(transformedSheetStocks);
          store.updateLastFetched();
          return;
        }

        const dbData = await getAllRecommendations();
        const merged = sheetData.map((sheetRow, idx) => {
          const dbRow = dbData.find(
            (db: any) => db.company_symbol === sheetRow.nseSymbol
          );

          return {
            id:
              dbRow?.id ??
              `${idx}-${sheetRow.nseSymbol || sheetRow.companyName}`,
            name: sheetRow.companyName,
            code: sheetRow.nseSymbol || "",
            marketCap: sheetRow.latestMcapCr
              ? `₹ ${Math.round(
                  parseFloat(String(sheetRow.latestMcapCr))
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} Cr.`
              : "₹ 0.00 Cr.",
            upside: Math.round(
              (sheetRow.upsidePotential || 0) * 100
            ).toString(),
            cmp: Math.round(sheetRow.cmpOrExitPrice || 0),
            entryPrice: Math.round(sheetRow.priceAtRecommendation || 0),
            target1: Math.round(sheetRow.targetPrice || 0),
            sector: dbRow?.sector ?? "",
            band: (sheetRow.action?.toUpperCase() as any) || "BUY",
            lastUpdated: sheetRow.dateRecommended || null,
            logo: dbRow?.logo,
            business_note: dbRow?.business_note,
            stock_performance_url: dbRow?.stock_performance_url || "",
            tags: dbRow?.tags || "",
            quick_bite: dbRow?.quick_bite,
            video: dbRow?.video,
            exit_rationale: dbRow?.exit_rationale,
            quarterly_update: dbRow?.quarterly_update || [],
            announcements_and_update: dbRow?.announcements_and_update || [],
            percentReturn: sheetRow.percentReturn,
          } as StockData;
        });

        const filteredDbData = merged.filter((r) =>
          dbData.map((r) => r.company_symbol).includes(r.code)
        );
        const notInserted = merged.filter(
          (r) => !dbData.map((r) => r.company_symbol).includes(r.code)
        );

        store.setDbData(filteredDbData);
        store.setNotInsertedData(notInserted);
        store.setStocks(merged);
        store.updateLastFetched();
      } catch (e: any) {
        const errorMsg = e?.message || "Failed to load recommendations";
        store.setError(errorMsg);
      } finally {
        setLocalLoading(false);
        store.setLoading(false);
      }
    })();
  }, [onlySheet, forceRefresh]);

  return {
    stocks: store.stocks,
    dbData: store.dbData,
    sheetStocks: store.sheetStocks,
    notInserterData: store.notInsertedData,
    loading: store.loading || localLoading,
    error: store.error,
  };
};

export default useSheetStocks;
