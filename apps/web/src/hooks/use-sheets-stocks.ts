import {useAuth} from '@/contexts/AuthContext';
import {useSubscription} from '@/hooks/use-subscription';
import {useLocation} from 'react-router-dom';
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

function getPrimaryIteration(row: any) {
  return Array.isArray(row?.stock_performance_url) &&
    row.stock_performance_url.length > 0
    ? row.stock_performance_url[0]
    : null;
}

// Retain sheet precision for the table without changing the existing card values.
const tableValues = (row: any): StockData['tableValues'] => {
  const n = (value: unknown) => value === null || value === undefined || String(value).trim() === '' || !Number.isFinite(Number(value)) ? null : Number(value);
  const upside = n(row.upsidePotential);
  return { marketCap: n(row.latestMcapCr), entryPrice: n(row.priceAtRecommendation), cmp: n(row.cmpOrExitPrice), targetPrice: n(row.targetPrice), expectedUpside: upside === null ? null : upside * 100 };
};

// Transform a single sheet row to StockData (sheet-only, not merged)
function transformSheetRowToStockData(sheetRow: any, idx: number): StockData {
  return {
    id: `${idx}-${sheetRow.nseSymbol || sheetRow.companyName}`,
    name: sheetRow.companyName,
    tableValues: tableValues(sheetRow),
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
  const primaryIteration = getPrimaryIteration(dbRow);
  return {
    id: dbRow?.id ?? `${idx}-${sheetRow.nseSymbol || sheetRow.companyName}`,
    name: sheetRow.companyName,
    tableValues: tableValues(sheetRow),
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
    business_note: primaryIteration?.business_note,
    stock_performance_url: dbRow?.stock_performance_url ?? undefined,
    tags: dbRow?.tags || "",
    quick_bite: primaryIteration?.quick_bite,
    video: primaryIteration?.video,
    exit_rationale: primaryIteration?.exit_rationale,
    quarterly_update:
      primaryIteration?.quarterly_update ?? dbRow?.quarterly_update ?? [],
    announcements_and_update:
      dbRow?.announcements_and_update ??
      primaryIteration?.announcements_and_update ??
      [],
    percentReturn: sheetRow.percentReturn,
    dateRecommended: (sheetRow.dateRecommended || "").toString(),
    dateExit: sheetRow.dateExit ? formatDateToYMD(sheetRow.dateExit) : primaryIteration?.exit_date || primaryIteration?.dateExit || "",
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
  const {user,isStaff}=useAuth();const {data:subscription}=useSubscription();const location=useLocation();
  const manage=!!isStaff && location.pathname.startsWith('/admin/');
  const [mergedStocks, setMergedStocks] = useState<StockData[]>([]);
  const [dbData, setDbData] = useState<StockData[]>([]);
  const [notInserterData, setNotInsertedData] = useState<StockData[]>([]);
  const [sheetStocks, setSheetStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active=true;
    setMergedStocks([]);setDbData([]);setNotInsertedData([]);setSheetStocks([]);
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Get Sheet Data
        const sheetData = await getSheetRecommendations();
        if(!active)return;
        // Transform for sheet-only structure
        const transformedSheetStocks: StockData[] = sheetData.map(
          transformSheetRowToStockData
        );
        setSheetStocks(transformedSheetStocks);

        if (onlySheet) {
          setMergedStocks(transformedSheetStocks);
          if(active)setLoading(false);
          return;
        }

        // Get DB data
        const dbDataArr = await getAllRecommendations(manage);
        // Merge All data
        const merged = sheetData.map((sheetRow, idx) => {
          const dbRow = dbDataArr.find(
            (db: any) => db.company_symbol === sheetRow.nseSymbol
          );
          return mergeSheetAndDbRow(sheetRow, dbRow, idx);
        });

        const { dbData: justDbData, notInsertedData } =
          partitionMergedByDbSymbol(merged, dbDataArr);

        if(!active)return;
        setDbData(justDbData);
        setNotInsertedData(notInsertedData);
        setMergedStocks(merged);
      } catch (e: any) {
        if(!active)return;
        setError(e?.message || "Failed to load recommendations");
      } finally {
        if(active)setLoading(false);
      }
    }
    fetchData();
    return()=>{active=false;};
  }, [onlySheet,user?.id,subscription?.is_premium,manage]);

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
