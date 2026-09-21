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
import { Download, RefreshCw, Edit, PlusIcon } from "lucide-react";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import useTacticalIdeas from "@/hooks/use-tactical-ideas";
import EditRecommendationModal from "@/components/core/common/Modals/EditRecommendationModal";
import AddRecommendationModal from "@/components/core/common/Modals/AddRecommendationModal";

const toCsv = (rows: ExtendedRecommendation[]): string => {
  const headers = [
    "Company Name",
    "NSE Symbol",
    "Date Recommended",
    "Entry Price",
    "CMP",
    "Holding Period",
    "% Return",
    "Action",
    "Upside Potential",
    "Latest Mcap (Rs. Cr)",
  ];
  const lines = rows.map((r) => [
    r.companyName || r.name,
    r.nseSymbol || r.code,
    r.dateRecommended || r.lastUpdated || "",
    r.entryPrice ?? "",
    r.cmp ?? "",
    r.holdingPeriod ?? "",
    r.percentReturn ??
      (r.cmp !== undefined && r.entryPrice
        ? (((r.cmp - r.entryPrice) / r.entryPrice) * 100).toFixed(1)
        : ""),
    r.action || r.band,
    r.upsidePotential ?? r.upside ?? "",
    r.latestMcapCr ?? r.marketCap ?? "",
  ]);
  return [headers.join(","), ...lines.map((l) => l.join(","))].join("\n");
};

const TacticalIdeasManagement: React.FC = () => {
  const { ideas: stocks, dbData, notInserterData, loading, error } =
    useTacticalIdeas();
  const [search, setSearch] = useState<string>("");
  const [editingRecommendation, setEditingRecommendation] =
    useState<ExtendedRecommendation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const processedRows: ExtendedRecommendation[] = useMemo(
    () =>
      dbData.map((row: any) => ({
        ...row,
        companyName: row.companyName || row.name,
        nseSymbol: row.nseSymbol || row.code,
        dateRecommended: row.dateRecommended || row.lastUpdated,
        entryPrice: row.entryPrice,
        action: row.action || row.band,
        upsidePotential: row.upsidePotential || row.upside,
        latestMcapCr: row.latestMcapCr || row.marketCap,
        percentReturn: (
          ((row.cmp - row.entryPrice) / row.entryPrice) *
          100
        ).toFixed(1),
      })),
    [stocks, dbData]
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

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleEdit = (recommendation: ExtendedRecommendation) => {
    setEditingRecommendation(recommendation);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedData: any) => {
    try {
      const formData =
        updatedData instanceof FormData ? updatedData : new FormData();

      if (!(updatedData instanceof FormData)) {
        Object.entries(updatedData || {}).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (typeof value === "object" && !(value instanceof Blob)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as any);
          }
        });
      }

      const { company_symbol } = Object.fromEntries(updatedData);

      formData.set(
        "company_symbol",
        (
          editingRecommendation?.nseSymbol ||
          editingRecommendation?.code ||
          company_symbol ||
          ""
        ).toString()
      );

      await axiosInstance.put(
        `/api/tactical-ideas/company/${encodeURIComponent(
          editingRecommendation?.nseSymbol ||
            editingRecommendation?.nseSymbol ||
            company_symbol ||
            ""
        )}`,
        formData
      );
      toast.success("Tactical Idea updated successfully");
      setIsEditModalOpen(false);
      handleRefresh();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.error || "Failed to update Tactical Idea"
      );
    }
  };

  const getActionBadgeColor = (action: string) => {
    const actionLower = action?.toLowerCase();
    if (actionLower === "buy") {
      return "bg-green-500 hover:bg-green-600";
    } else if (actionLower === "hold") {
      return "bg-[#C4B696] hover:bg-[#C4B696]";
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
    link.download = "tactical-ideas.csv";
    link.click();
  };

  const createRecommendationHandler = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Tactical Ideas
          </h1>
          <p className="text-muted-foreground">
            View and edit Tactical Ideas data from the configured Google Sheet.
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
          <CardTitle className="flex justify-between items-center">
            <span>Tactical Ideas</span>
            <Button onClick={createRecommendationHandler}>
              <PlusIcon className="mr-2 h-4 w-4" /> Create Tactical Idea
            </Button>
          </CardTitle>
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
                No tactical ideas found
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
                    <TableHead>CMP</TableHead>
                    <TableHead>% Return</TableHead>
                    <TableHead>Action</TableHead>
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
                      <TableCell>{recommendation.entryPrice}</TableCell>
                      <TableCell>{recommendation.cmp}</TableCell>
                      <TableCell>
                        <span
                          className={
                            (
                              recommendation.percentReturn?.toString() ?? ""
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
                          className={
                            getActionBadgeColor(
                              recommendation.action ?? recommendation.band
                            ) + " cursor-pointer"
                          }
                        >
                          {recommendation.action ?? recommendation.band}
                        </Badge>
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

      <AddRecommendationModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        sheetStocks={notInserterData as any}
        onSave={handleSave as any}
      />
    </div>
  );
};

export default TacticalIdeasManagement;

