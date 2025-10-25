import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ColDef } from "ag-grid-community";
import { Download, RefreshCw } from "lucide-react";
import { RecommendationRecord, fetchRecommendationsFromSheet, getSheetUrl } from "@/lib/recommendations";

const toCsv = (rows: RecommendationRecord[]): string => {
  const headers = [
    "Company Name",
    "NSE Symbol",
    "Date Recommended",
    "Price At Recommendation",
    "Date Exit",
    "Holding Period",
    "CMP/Exit Price",
    "% Return",
    "Action",
    "Target Price",
    "Upside Potential",
    "Latest Mcap (Rs. Cr)",
  ];
  const lines = rows.map((r) => [
    r.companyName,
    r.nseSymbol,
    r.dateRecommended,
    r.priceAtRecommendation,
    r.dateExit ?? "",
    r.holdingPeriod ?? "",
    r.cmpOrExitPrice,
    r.percentReturn,
    r.action,
    r.targetPrice,
    r.upsidePotential,
    r.latestMcapCr,
  ]);
  return [headers.join(","), ...lines.map((l) => l.join(","))].join("\n");
};

const RecommendationManagement: React.FC = () => {
  const [rows, setRows] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = getSheetUrl();
      const data = await fetchRecommendationsFromSheet(url);
      setRows(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.companyName, r.nseSymbol, r.action]
        .map((v) => String(v || "").toLowerCase())
        .some((v) => v.includes(term))
    );
  }, [rows, search]);

  const columns: ColDef[] = [
    { headerName: "Company", field: "companyName", flex: 2, minWidth: 200, editable: true },
    { headerName: "Symbol", field: "nseSymbol", flex: 1, minWidth: 120, editable: true },
    { headerName: "Recommended", field: "dateRecommended", flex: 1, minWidth: 140, editable: true },
    { headerName: "Entry", field: "priceAtRecommendation", flex: 1, minWidth: 120, editable: true },
    { headerName: "CMP/Exit", field: "cmpOrExitPrice", flex: 1, minWidth: 120, editable: true },
    { headerName: "% Return", field: "percentReturn", flex: 1, minWidth: 120, editable: true },
    { headerName: "Action", field: "action", flex: 1, minWidth: 120, editable: true },
    { headerName: "Target", field: "targetPrice", flex: 1, minWidth: 120, editable: true },
    { headerName: "Upside %", field: "upsidePotential", flex: 1, minWidth: 120, editable: true },
    { headerName: "Mcap (Cr)", field: "latestMcapCr", flex: 1, minWidth: 120, editable: true },
  ];

  const onCellValueChanged = (event: any) => {
    const updated = [...rows];
    updated[event.rowIndex] = { ...updated[event.rowIndex], [event.colDef.field!]: event.newValue } as any;
    setRows(updated);
  };

  const downloadCsv = () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "recommendations.csv";
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Recommendations</h1>
          <p className="text-muted-foreground">View and edit recommendations data from the configured Google Sheet. You can export CSV and update your Sheet.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={downloadCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search by company, symbol or action..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable
            data={filtered}
            columns={columns}
            loading={loading}
            error={error || undefined}
            onCellValueChanged={onCellValueChanged}
            title="Recommendations"
            description={`${filtered.length} items`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationManagement;

