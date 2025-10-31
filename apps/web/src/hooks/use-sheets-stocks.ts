import { getAllRecommendations } from "@/api/recommendations-apis";
import {
  fetchRecommendationsFromSheet,
  getSheetUrl,
  RecommendationRecord,
} from "@/lib/recommendations";
import { useSheetStocksStore } from "@/stores/recommendation-store";
import { useEffect, useState } from "react";

const useSheetStocks = (onlySheet: boolean = false) => {
  const [mergedStocks, setMergedStocks] = useState<StockData[]>([]);
  const [sheetStocks, setSheetStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get/set access to the global atom
  const setRawSheetData = useSheetStocksStore((s) => s.setRawSheetData);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from Google Sheets
        const url = await getSheetUrl("recommendations");
        const sheetData = await fetchRecommendationsFromSheet(
          url,
          "recommendations"
        );

        // Save raw sheet data globally in the atom
        setRawSheetData(sheetData as RecommendationRecord[]);

        // Transform sheet data (common transformation for both cases)
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
            upside: Math.round(sheetRow.upsidePotential || 0),
            cmp: Math.round(sheetRow.cmpOrExitPrice || 0),
            entryPrice: Math.round(sheetRow.priceAtRecommendation || 0),
            target1: Math.round(sheetRow.targetPrice || 0),
            sector: (sheetRow as any).sector || "",
            band: (sheetRow.action?.toUpperCase() as any) || "BUY",
            lastUpdated: (sheetRow.dateRecommended || "").toString(),
          })
        );
        setSheetStocks(transformedSheetStocks);

        if (onlySheet) {
          // If flag set, do not fetch API nor merge – just finish here
          setMergedStocks(transformedSheetStocks);
          setLoading(false);
          return;
        }

        // Otherwise, fetch from database API and merge
        const dbData = await getAllRecommendations();

        const merged = sheetData.map((sheetRow, idx) => {
          const dbRow = dbData.find(
            (db: any) => db.company_name === sheetRow.companyName
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
            upside: Math.round(sheetRow.upsidePotential || 0),
            cmp: Math.round(sheetRow.cmpOrExitPrice || 0),
            entryPrice: Math.round(sheetRow.priceAtRecommendation || 0),
            target1: Math.round(sheetRow.targetPrice || 0),
            sector: dbRow?.sector ?? "",
            band: (sheetRow.action?.toUpperCase() as any) || "BUY",
            lastUpdated: (sheetRow.dateRecommended || "").toString(),
            logo: dbRow?.logo,
            business_note: dbRow?.business_note,
            stock_performance_url: dbRow?.stock_performance_url || "",
            quick_bite: dbRow?.quick_bite,
            video: dbRow?.video,
            exit_rationale: dbRow?.exit_rationale,
            quarterly_update: dbRow?.quarterly_update || [],
            announcements_and_update: dbRow?.announcements_and_update || [],
          } as StockData;
        });

        setMergedStocks(merged);
      } catch (e: any) {
        setError(e?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    })();
  }, [onlySheet, setRawSheetData]);

  return { stocks: mergedStocks, sheetStocks, loading, error };
};

export default useSheetStocks;
