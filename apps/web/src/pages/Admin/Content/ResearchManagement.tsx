import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { researchApi } from "@/api/content";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const ResearchManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Research[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await researchApi.getAll();
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load research list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (r) =>
        r.company.toLowerCase().includes(q) ||
        (r.sector || "").toLowerCase().includes(q) ||
        (r.action || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const onView = (id: string) => {
    navigate(`/research/${id}`);
  };

  const onEdit = (id: string) => {
    navigate(`/admin/content/research/${id}/edit`);
  };

  const onCreate = () => {
    navigate(`/admin/content/research/create`);
  };

  const onDelete = async (id: string, label: string) => {
    if (!confirm(`Delete research for \"${label}\"?`)) return;
    try {
      await researchApi.delete(id);
      toast.success("Deleted successfully");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    }
  };

  const fmt = (d?: string) => (d ? format(new Date(d), "MMM dd, yyyy") : "-");

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📑</span>
          <h1 className="text-2xl font-bold">Research Management</h1>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Research
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search company, sector, action..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Research</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No research found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Coverage Initiation Date</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>% Return since Rec</TableHead>
                  <TableHead>% IRR Potential</TableHead>
                  <TableHead>Research Material</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {fmt(item.coverage_initiation_date)}
                      </div>
                    </TableCell>
                    <TableCell>{item.sector || "-"}</TableCell>
                    <TableCell>{item.action || "-"}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={item.comments}>{item.comments || "-"}</div>
                    </TableCell>
                    <TableCell>{item.percent_return_since_recommendation ?? "-"}</TableCell>
                    <TableCell>{item.percent_irr_potential_from_cmp ?? "-"}</TableCell>
                    <TableCell>
                      {item.research_material_url ? (
                        <button
                          className="text-blue-600 underline"
                          onClick={() => onView(item.id)}
                        >
                          View PDF
                        </button>
                      ) : (
                        <span className="text-gray-400">No file</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(item.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(item.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(item.id, item.company)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchManagement;

