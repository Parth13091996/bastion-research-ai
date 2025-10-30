import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Download, RefreshCw, Edit } from "lucide-react";
import {
  RecommendationRecord,
  fetchRecommendationsFromSheet,
} from "@/lib/recommendations";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import EditRecommendationModal from "@/components/core/common/Modals/EditRecommendationModal";

export interface ExtendedRecommendation extends RecommendationRecord {
  id?: number;
  logo?: string;
  business_note?: string;
  quick_bite?: string;
  video?: string;
  exit_rationale?: string;
  quarterly_update?: UpdateItem[];
  announcements_and_update?: UpdateItem[];
}

export interface UpdateItem {
  date: string;
  title: string;
  description: string;
  pdf_url: string;
}

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
  const [rows, setRows] = useState<ExtendedRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [editingRecommendation, setEditingRecommendation] = useState<ExtendedRecommendation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from Google Sheets
      const sheetData = await fetchRecommendationsFromSheet('recommendations');

      // Fetch from database
      const dbResponse = await axiosInstance.get("/api/recommendations");
      const dbData = dbResponse.data || [];

      // Merge sheet data with database data
      const merged = sheetData.map((sheetRow) => {
        const dbRow = dbData.find(
          (db: any) => db.company_name === sheetRow.companyName
        );
        return {
          ...sheetRow,
          id: dbRow?.id,
          logo: dbRow?.logo,
          business_note: dbRow?.business_note,
          quick_bite: dbRow?.quick_bite,
          video: dbRow?.video,
          exit_rationale: dbRow?.exit_rationale,
          quarterly_update: dbRow?.quarterly_update || [],
          announcements_and_update: dbRow?.announcements_and_update || [],
        } as ExtendedRecommendation;
      });

      setRows(merged);
    } catch (e: any) {
      setError(e?.message || "Failed to load recommendations");
      toast.error("Failed to load recommendations");
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

  const handleEdit = (recommendation: ExtendedRecommendation) => {
    setEditingRecommendation(recommendation);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedData: Partial<ExtendedRecommendation>) => {
    try {
      await axiosInstance.put(
        `/api/recommendations/company/${encodeURIComponent(editingRecommendation?.companyName || '')}`,
        {
          company_name: editingRecommendation?.companyName,
          ...updatedData,
        }
      );
      toast.success("Recommendation updated successfully");
      setIsEditModalOpen(false);
      load(); // Reload data
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update recommendation");
    }
  };

  const columns: ColDef[] = [
    {
      headerName: "Company",
      field: "companyName",
      flex: 2,
      minWidth: 200,
      editable: false,
    },
    {
      headerName: "Symbol",
      field: "nseSymbol",
      flex: 1,
      minWidth: 120,
      editable: false,
    },
    {
      headerName: "Recommended",
      field: "dateRecommended",
      flex: 1,
      minWidth: 140,
      editable: false,
    },
    {
      headerName: "Entry",
      field: "priceAtRecommendation",
      flex: 1,
      minWidth: 120,
      editable: false,
    },
    {
      headerName: "CMP/Exit",
      field: "cmpOrExitPrice",
      flex: 1,
      minWidth: 120,
      editable: false,
    },
    {
      headerName: "% Return",
      field: "percentReturn",
      flex: 1,
      minWidth: 120,
      editable: false,
    },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
      minWidth: 120,
      editable: false,
    },
    {
      headerName: "Target",
      field: "targetPrice",
      flex: 1,
      minWidth: 120,
      editable: false,
    },
    {
      headerName: "Upside %",
      field: "upsidePotential",
      flex: 1,
      minWidth: 120,
      editable: false,
    },
    {
      headerName: "Mcap (Cr)",
      field: "latestMcapCr",
      flex: 1,
      minWidth: 120,
      editable: false,
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: ICellRendererParams) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEdit(params.data)}
          className="mt-1"
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
      ),
    },
  ];

  const onCellValueChanged = (event: any) => {
    const updated = [...rows];
    updated[event.rowIndex] = {
      ...updated[event.rowIndex],
      [event.colDef.field!]: event.newValue,
    } as any;
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
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Recommendations
          </h1>
          <p className="text-muted-foreground">
            View and edit recommendations data from the configured Google Sheet.
            You can export CSV and update additional fields like PDFs, videos, and updates.
          </p>
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
            <Input
              placeholder="Search by company, symbol or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DataTable
            data={filtered}
            columns={columns}
            loading={loading}
            error={error || undefined}
            title="Recommendations"
            description={`${filtered.length} items`}
          />
        </CardContent>
      </Card>

      {editingRecommendation && (
        <EditRecommendationModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          recommendation={editingRecommendation}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default RecommendationManagement;
