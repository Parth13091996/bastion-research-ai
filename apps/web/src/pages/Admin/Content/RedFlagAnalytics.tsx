import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { redFlagApi } from "@/api/red-flag-api";
import { uploadFile } from "@/api/files-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Plus, Trash2, Edit, X, Check, Search } from "lucide-react";
import { RED_FLAG_QUESTIONS, type RedFlagQuestionKey } from "@/config/redFlagQuestions";
import { useSectionEditAccess } from "@/hooks/use-section-edit-access";
// Remove unused ConfirmationModal and modal-store imports, matching WebinarManagement.tsx approach

const getQuestionLabel = (key: string) =>
  (RED_FLAG_QUESTIONS as Partial<Record<RedFlagQuestionKey, { name: string }>>)[
    key as RedFlagQuestionKey
  ]?.name ?? key;

const RedFlagAnalytics: React.FC = () => {
  const { canEdit } = useSectionEditAccess("content_red_flag_analytics");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RedFlagCompanyStats[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    id: string | null;
    name: string | null;
    mode: "delete-company" | "clear-stats";
  }>({ open: false, id: null, name: null, mode: "clear-stats" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showManageCompaniesModal, setShowManageCompaniesModal] = useState(false);
  const [manageSearchQuery, setManageSearchQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await redFlagApi.admin.getStats();
      setStats(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const name = newCompanyName.trim();
    if (!name) return;
    if (!canEdit) return;

    // Duplicate check
    const exists = stats.some(s => s.company.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error(`Company "${name}" already exists.`);
      return;
    }

    try {
      await redFlagApi.admin.createCompany({
        name,
      });
      toast.success("Company created");
      setNewCompanyName("");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to create company");
    }
  };

  const handleUpdate = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    if (!canEdit) return;

    // Duplicate check
    const exists = stats.some(s => s.company.id !== id && s.company.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.error(`Company "${name}" already exists.`);
      return;
    }

    setIsUpdating(true);
    try {
      await redFlagApi.admin.updateCompany(id, { name });
      toast.success("Company updated");
      setEditingId(null);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update company");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = (id: string, name: string, mode: "delete-company" | "clear-stats" = "delete-company") => {
    if (!canEdit) return;
    setConfirmState({ open: true, id, name, mode });
  };

  const handleDelete = async () => {
    if (!confirmState.id || !confirmState.name) return;
    if (!canEdit) return;
    setDeletingId(confirmState.id);
    try {
      if (confirmState.mode === "delete-company") {
        await redFlagApi.admin.deleteCompany(confirmState.id);
        toast.success("Company deleted");
      } else {
        await redFlagApi.admin.clearCompanyStats(confirmState.id);
        toast.success("Analytics data cleared");
      }
      await load();
    } catch (e: any) {
      const action = confirmState.mode === "delete-company" ? "delete company" : "clear analytics";
      toast.error(e?.response?.data?.error || `Failed to ${action}`);
    } finally {
      setDeletingId(null);
      setConfirmState({ open: false, id: null, name: null, mode: "clear-stats" });
    }
  };

  const handleCancelDelete = () => {
    setConfirmState({ open: false, id: null, name: null, mode: "clear-stats" });
  };

  const rows = useMemo(() => {
    let filtered = stats.filter(s => s.flaggedQuestions.length > 0 || s.usersFrequency > 0);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.company.name.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) =>
      a.company.name.localeCompare(b.company.name)
    );
  }, [stats, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Confirmation Modal, matching WebinarManagement style */}
      {confirmState.open && (
        <div className="fixed inset-0 flex items-center justify-center z-[3000] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200 border relative z-[3001]">
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              {confirmState.mode === "delete-company" ? `Delete ${confirmState.name}?` : `Clear Analytics for ${confirmState.name}?`}
            </h3>
            <p className="mb-8 text-gray-600 leading-relaxed">
              {confirmState.mode === "delete-company" 
                ? `Are you sure you want to delete the company "${confirmState.name}"? This action cannot be undone.`
                : `Are you sure you want to clear all forensic submissions for "${confirmState.name}"? This will reset its stats but keep the company name.`
              }
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={deletingId === confirmState.id}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletingId === confirmState.id}
                className="px-6 bg-red-600 hover:bg-red-700"
              >
                {deletingId === confirmState.id 
                  ? (confirmState.mode === "delete-company" ? "Deleting..." : "Clearing...") 
                  : (confirmState.mode === "delete-company" ? "Delete" : "Clear Data")
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Red Flag Analytics</h1>
          <p className="text-muted-foreground">
            Company-wise flagged questions and unique user frequency
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={load}
          disabled={loading}
          className="text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4 text-white" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col space-y-1.5 p-0">
            <CardTitle>Create Company</CardTitle>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManageCompaniesModal(true)}
              className="h-8"
            >
              <Search className="mr-2 h-4 w-4" /> Show Company List
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 max-w-xl">
            <div className="flex gap-2 flex-wrap items-end">
              <div className="flex-1 min-w-[200px] space-y-2">
                <Label htmlFor="red-flag-company-name">Company name</Label>
                <Input
                  id="red-flag-company-name"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. PB Fintech"
                  disabled={!canEdit}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={
                  !canEdit || !newCompanyName.trim() || loading
                }
              >
                <Plus className="mr-2 h-4 w-4" />{" "}
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Company Stats</CardTitle>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Flagged Questions</TableHead>
                <TableHead className="text-right">Users Frequency</TableHead>
                <TableHead className="text-center" style={{ width: 80 }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {loading ? "Loading..." : "No companies found"}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.company.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {editingId === r.company.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 py-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate(r.company.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleUpdate(r.company.id)}
                              disabled={isUpdating}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span>{r.company.name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.flaggedQuestions.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="space-y-1">
                          {r.flaggedQuestions.map((fq) => (
                            <div key={fq.key} className="flex items-start gap-2">
                              <span className="text-sm">{getQuestionLabel(fq.key)}</span>
                              <span className="text-sm text-muted-foreground">
                                — {fq.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{r.usersFrequency}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={deletingId === r.company.id || loading}
                          onClick={() => handleConfirmDelete(r.company.id, r.company.name, "clear-stats")}
                          title="Clear Analytics"
                          aria-label="Clear analytics"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manage Companies Modal (Admin version) */}
      {canEdit && showManageCompaniesModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 leading-none">Manage Companies</h3>
                <p className="text-sm text-muted-foreground mt-1.5">View, edit, or delete existing companies</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setShowManageCompaniesModal(false); setEditingId(null); setManageSearchQuery(""); }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={manageSearchQuery}
                  onChange={(e) => setManageSearchQuery(e.target.value)}
                  placeholder="Search companies..."
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              <div className="grid gap-2">
                {stats
                  .filter(s => s.company.name.toLowerCase().includes(manageSearchQuery.toLowerCase()))
                  .sort((a, b) => a.company.name.localeCompare(b.company.name))
                  .map((s) => (
                    <div
                      key={s.company.id}
                      className="group flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {editingId === s.company.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-4">
                          <Input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdate(s.company.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <Button
                            size="icon"
                            variant="default"
                            className="h-8 w-8 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleUpdate(s.company.id)}
                            disabled={isUpdating}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-800">{s.company.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 isolate">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors pointer-events-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(s.company.id);
                                setEditingName(s.company.name);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors pointer-events-auto"
                              disabled={deletingId === s.company.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmDelete(s.company.id, s.company.name);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                {stats.filter(s => s.company.name.toLowerCase().includes(manageSearchQuery.toLowerCase())).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-white border border-dashed rounded-lg">
                    No results found for "{manageSearchQuery}"
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-end">
              <Button
                variant="outline"
                onClick={() => { setShowManageCompaniesModal(false); setEditingId(null); setManageSearchQuery(""); }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedFlagAnalytics;
