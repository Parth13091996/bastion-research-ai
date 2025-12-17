import { useEffect, useState } from "react";
import {
  getAllTacticalIdeas,
  getSheetTacticalIdeas,
} from "@/api/tactical-ideas-apis";

// Reuse StockData shape from recommendations
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

function transformSheetRowToStockData(sheetRow: any, idx: number): StockData {
  return {
    id: `${idx}-${sheetRow.nseSymbol || sheetRow.companyName}`,
    name: sheetRow.companyName,
    code: sheetRow.nseSymbol || "",
    marketCap: Number(sheetRow.latestMcapCr).toFixed(0),
    upside: Math.round((sheetRow.upsidePotential || 0) * 100).toString(),
    cmp: Math.round(sheetRow.cmpOrExitPrice || 0),
    entryPrice: Math.round(sheetRow.priceAtRecommendation || 0),
    target1: 0,
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
    stopLoss: sheetRow?.stopLoss ? sheetRow?.stopLoss : 0,
  };
}

function mergeSheetAndDbRow(sheetRow: any, dbRow: any, idx: number): StockData {
  return {
    id: dbRow?.id ?? `${idx}-${sheetRow.nseSymbol || sheetRow.companyName}`,
    name: sheetRow.companyName,
    code: sheetRow.nseSymbol || "",
    marketCap: Number(sheetRow.latestMcapCr).toFixed(0),
    upside: Math.round((sheetRow.upsidePotential || 0) * 100).toString(),
    cmp: Number(dbRow?.cmp ?? sheetRow.cmpOrExitPrice ?? 0),
    entryPrice: Number(dbRow?.entry_price ?? sheetRow.priceAtRecommendation),
    stopLoss: dbRow?.stop_loss != null ? Number(dbRow.stop_loss) : undefined,
    target1: 0,
    sector: dbRow?.sector ?? "",
    band: (sheetRow.action?.toUpperCase() as any) || "BUY",
    lastUpdated: dbRow?.updated_at || null,
    logo: dbRow?.logo,
    business_note: dbRow?.business_note,
    stock_performance_url: dbRow?.stock_performance_url ?? undefined,
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

const useTacticalIdeas = (onlySheet: boolean = false) => {
  const [mergedIdeas, setMergedIdeas] = useState<StockData[]>([]);
  const [dbData, setDbData] = useState<StockData[]>([]);
  const [notInserterData, setNotInsertedData] = useState<StockData[]>([]);
  const [sheetIdeas, setSheetIdeas] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const sheetData = await getSheetTacticalIdeas();
        console.log(sheetData, "sheet");
        const transformedSheet: StockData[] = sheetData.map(
          transformSheetRowToStockData
        );
        setSheetIdeas(transformedSheet);

        if (onlySheet) {
          setMergedIdeas(transformedSheet);
          setLoading(false);
          return;
        }

        const dbDataArr = await getAllTacticalIdeas();
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
        setMergedIdeas(merged);
      } catch (e: any) {
        setError(e?.message || "Failed to load Tactical Ideas");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [onlySheet]);

  return {
    ideas: mergedIdeas,
    dbData,
    sheetIdeas,
    notInserterData,
    loading,
    error,
  };
};

export default useTacticalIdeas;
