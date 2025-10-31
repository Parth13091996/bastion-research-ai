import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, RefreshCw, Edit } from "lucide-react";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import EditRecommendationModal from "@/components/core/common/Modals/EditRecommendationModal";
import useSheetStocks from "@/hooks/use-sheets-stocks";

export interface ExtendedRecommendation {
  id?: number | string;
  name: string;
  code: string;
  marketCap: string;
  upside: number;
  cmp: number;
  entryPrice: number;
  target1: number;
  sector?: string;
  band: string;
  lastUpdated?: string;
  logo?: string;
  business_note?: string;
  quick_bite?: string;
  video?: string;
  exit_rationale?: string;
  quarterly_update?: UpdateItem[];
  announcements_and_update?: UpdateItem[];
  // For CSV compatibility with previous prop names:
  companyName?: string;
  nseSymbol?: string;
  dateRecommended?: string;
  priceAtRecommendation?: number;
  dateExit?: string;
  holdingPeriod?: string;
  cmpOrExitPrice?: number;
  percentReturn?: string | number;
  action?: string;
  targetPrice?: number;
  upsidePotential?: number;
  latestMcapCr?: number | string;
}

export interface UpdateItem {
  date: string;
  title: string;
  description: string;
  pdf_url: string;
}

const toCsv = (rows: ExtendedRecommendation[]): string => {
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
    r.companyName || r.name,
    r.nseSymbol || r.code,
    r.dateRecommended || r.lastUpdated || "",
    r.priceAtRecommendation ?? r.entryPrice ?? "",
    r.dateExit ?? "",
    r.holdingPeriod ?? "",
    r.cmpOrExitPrice ?? r.cmp ?? "",
    r.percentReturn ??
      (r.cmp !== undefined && r.entryPrice
        ? (((r.cmp - r.entryPrice) / r.entryPrice) * 100).toFixed(1)
        : ""),
    r.action || r.band,
    r.targetPrice ?? r.target1 ?? "",
    r.upsidePotential ?? r.upside ?? "",
    r.latestMcapCr ?? r.marketCap ?? "",
  ]);
  return [headers.join(","), ...lines.map((l) => l.join(","))].join("\n");
};

const RecommendationManagement: React.FC = () => {
  // Use custom hook for merged (API+sheet) stocks
  const { stocks, loading, error } = useSheetStocks(); // DO NOT pass 'true'
  const [search, setSearch] = useState<string>("");
  const [editingRecommendation, setEditingRecommendation] =
    useState<ExtendedRecommendation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mutate/copy hook data to ensure all legacy/expected fields are present for CSV/etc
  const processedRows: ExtendedRecommendation[] = useMemo(
    () =>
      stocks.map((row: any) => ({
        ...row,
        companyName: row.companyName || row.name,
        nseSymbol: row.nseSymbol || row.code,
        dateRecommended: row.dateRecommended || row.lastUpdated,
        priceAtRecommendation: row.priceAtRecommendation || row.entryPrice,
        action: row.action || row.band,
        targetPrice: row.targetPrice || row.target1,
        upsidePotential: row.upsidePotential || row.upside,
        latestMcapCr: row.latestMcapCr || row.marketCap,
        cmpOrExitPrice: row.cmpOrExitPrice || row.cmp,
        percentReturn:
          row.percentReturn ??
          (row.cmp !== undefined && row.entryPrice
            ? (((row.cmp - row.entryPrice) / row.entryPrice) * 100).toFixed(1)
            : undefined),
      })),
    [stocks]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return processedRows;
    return processedRows.filter((r) =>
      [r.companyName ?? r.name, r.nseSymbol ?? r.code, r.action ?? r.band]
        .map((v) => String(v || "").toLowerCase())
        .some((v) => v.includes(term))
    );
  }, [processedRows, search]);

  // "Reload" mimics hook refresh by reloading the page (you could use key prop if you want granular)
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleEdit = (recommendation: ExtendedRecommendation) => {
    setEditingRecommendation(recommendation);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedData: Partial<ExtendedRecommendation>) => {
    try {
      await axiosInstance.put(
        `/api/recommendations/company/${encodeURIComponent(
          editingRecommendation?.companyName ||
            editingRecommendation?.name ||
            ""
        )}`,
        {
          company_name:
            editingRecommendation?.companyName || editingRecommendation?.name,
          ...updatedData,
        }
      );
      toast.success("Recommendation updated successfully");
      setIsEditModalOpen(false);
      handleRefresh(); // Reload to re-trigger hook
    } catch (e: any) {
      toast.error(
        e?.response?.data?.error || "Failed to update recommendation"
      );
    }
  };

  const getActionBadgeColor = (action: string) => {
    const actionLower = action?.toLowerCase();
    if (actionLower === "buy" || actionLower === "hold") {
      return "bg-green-500 hover:bg-green-600";
    } else if (actionLower === "exit" || actionLower === "exited") {
      return "bg-red-500 hover:bg-red-600";
    }
    return "bg-gray-500 hover:bg-gray-600";
  };

  const downloadCsv = () => {
    const csv = toCsv(processedRows);
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
            You can export CSV and update additional fields like PDFs, videos,
            and updates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4 text-white" /> Refresh
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

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">
                No recommendations found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or refresh the data.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Company</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Recommended</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>CMP/Exit</TableHead>
                    <TableHead>% Return</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Upside %</TableHead>
                    <TableHead>Mcap (Cr)</TableHead>
                    <TableHead className="w-[100px] text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((recommendation, index) => (
                    <TableRow
                      key={
                        (recommendation.companyName || recommendation.name) +
                        index
                      }
                    >
                      <TableCell className="font-medium">
                        <div
                          className="max-w-[180px] truncate"
                          title={
                            recommendation.companyName || recommendation.name
                          }
                        >
                          {recommendation.companyName || recommendation.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {recommendation.nseSymbol || recommendation.code}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {recommendation.dateRecommended ||
                          recommendation.lastUpdated}
                      </TableCell>
                      <TableCell>
                        {recommendation.priceAtRecommendation ??
                          recommendation.entryPrice}
                      </TableCell>
                      <TableCell>
                        {recommendation.cmpOrExitPrice ?? recommendation.cmp}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            (
                              recommendation.percentReturn?.toString() ??
                              (recommendation.cmp !== undefined &&
                              recommendation.entryPrice
                                ? (
                                    ((recommendation.cmp -
                                      recommendation.entryPrice) /
                                      recommendation.entryPrice) *
                                    100
                                  ).toFixed(1)
                                : "")
                            )
                              .toString()
                              .startsWith("-")
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {recommendation.percentReturn ??
                            (recommendation.cmp !== undefined &&
                            recommendation.entryPrice
                              ? (
                                  ((recommendation.cmp -
                                    recommendation.entryPrice) /
                                    recommendation.entryPrice) *
                                  100
                                ).toFixed(1)
                              : "")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getActionBadgeColor(
                            recommendation.action ?? recommendation.band
                          )}
                        >
                          {recommendation.action ?? recommendation.band}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {recommendation.targetPrice ?? recommendation.target1}
                      </TableCell>
                      <TableCell>
                        {recommendation.upsidePotential ??
                          recommendation.upside}
                      </TableCell>
                      <TableCell>
                        {recommendation.latestMcapCr ??
                          recommendation.marketCap}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(recommendation)}
                          className="hover:bg-yellow-100 hover:text-yellow-600"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingRecommendation && (
        <EditRecommendationModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          recommendation={editingRecommendation as any}
          onSave={handleSave as any}
        />
      )}
    </div>
  );
};

export default RecommendationManagement;
