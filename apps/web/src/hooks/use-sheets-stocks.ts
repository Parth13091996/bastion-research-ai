import {
  getAllRecommendations,
  getSheetRecommendations,
} from "@/api/recommendations-apis";
import { useEffect, useState } from "react";

// Utility to format date as YYYY-MM-DD
function formatDateToYMD(d: Date | string): string {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (!(dateObj instanceof Date) || isNaN(dateObj.valueOf())) {
    return typeof d === "string" ? d : "";
  }
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Transform a single sheet row to StockData (sheet-only, not merged)
function transformSheetRowToStockData(sheetRow: any, idx: number): StockData {
  return {
    id: `${idx}-${sheetRow.nseSymbol || sheetRow.companyName}`,
    name: sheetRow.companyName,
    code: sheetRow.nseSymbol || "",
    marketCap: Number(sheetRow.latestMcapCr).toFixed(0),
    upside: Math.round((sheetRow.upsidePotential || 0) * 100).toString(),
    cmp: Math.round(sheetRow.cmpOrExitPrice || 0),
    entryPrice: Math.round(sheetRow.priceAtRecommendation || 0),
    target1: Math.round(sheetRow.targetPrice || 0),
    sector: (sheetRow as any).sector || "",
    band: (sheetRow.action?.toUpperCase() as any) || "BUY",
    dateRecommended: (sheetRow.dateRecommended || "").toString(),
    percentReturn: Math.round((sheetRow.percentReturn || 0) * 100),
    holdingPeriod: sheetRow?.holdingPeriod
      ? typeof sheetRow.holdingPeriod === "number"
        ? `${sheetRow.holdingPeriod} days`
        : sheetRow.holdingPeriod
      : "",
    dateExit: sheetRow?.dateExit ? formatDateToYMD(sheetRow.dateExit) : "",
  };
}

// Merges a row from sheet with a possible db row, mapping all available fields
function mergeSheetAndDbRow(sheetRow: any, dbRow: any, idx: number): StockData {
  return {
    id: dbRow?.id ?? `${idx}-${sheetRow.nseSymbol || sheetRow.companyName}`,
    name: sheetRow.companyName,
    code: sheetRow.nseSymbol || "",
    marketCap: Number(sheetRow.latestMcapCr).toFixed(0),
    upside: Math.round((sheetRow.upsidePotential || 0) * 100).toString(),
    cmp: Math.round(sheetRow.cmpOrExitPrice || 0),
    entryPrice: Math.round(sheetRow.priceAtRecommendation || 0),
    target1: Math.round(sheetRow.targetPrice || 0),
    sector: dbRow?.sector ?? "",
    band: (sheetRow.action?.toUpperCase() as any) || "BUY",
    lastUpdated: dbRow?.updated_at || null,
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
    dateRecommended: (sheetRow.dateRecommended || "").toString(),
  } as StockData;
}

// Helper to partition merged stocks into dbData and notInsertedData
function partitionMergedByDbSymbol(
  merged: StockData[],
  dbDataArr: any[]
): { dbData: StockData[]; notInsertedData: StockData[] } {
  const dbSymbols = dbDataArr.map((r) => r.company_symbol);
  return {
    dbData: merged.filter((r) => dbSymbols.includes(r.code)),
    notInsertedData: merged.filter((r) => !dbSymbols.includes(r.code)),
  };
}

const useSheetStocks = (onlySheet: boolean = false) => {
  const [mergedStocks, setMergedStocks] = useState<StockData[]>([]);
  const [dbData, setDbData] = useState<StockData[]>([]);
  const [notInserterData, setNotInsertedData] = useState<StockData[]>([]);
  const [sheetStocks, setSheetStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Get Sheet Data
        const sheetData = await getSheetRecommendations();
        // Transform for sheet-only structure
        const transformedSheetStocks: StockData[] = sheetData.map(
          transformSheetRowToStockData
        );
        setSheetStocks(transformedSheetStocks);

        if (onlySheet) {
          setMergedStocks(transformedSheetStocks);
          setLoading(false);
          return;
        }

        // Get DB data
        const dbDataArr = await getAllRecommendations();
        // Merge All data
        const merged = sheetData.map((sheetRow, idx) => {
          const dbRow = dbDataArr.find(
            (db: any) => db.company_symbol === sheetRow.nseSymbol
          );
          return mergeSheetAndDbRow(sheetRow, dbRow, idx);
        });

        const { dbData: justDbData, notInsertedData } =
          partitionMergedByDbSymbol(merged, dbDataArr);

        setDbData(justDbData);
        setNotInsertedData(notInsertedData);
        setMergedStocks(merged);
      } catch (e: any) {
        setError(e?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [onlySheet]);

  return {
    stocks: mergedStocks,
    dbData,
    sheetStocks,
    notInserterData,
    loading,
    error,
  };
};

export default useSheetStocks;
