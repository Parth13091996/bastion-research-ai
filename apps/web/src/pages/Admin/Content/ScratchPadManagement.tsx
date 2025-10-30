import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColDef } from "ag-grid-community";
import { Plus, RefreshCw, Edit, Trash2, Eye } from "lucide-react";
import { scratchPadApi, ScratchPadNewsletter } from "@/api/scratchpad";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ScratchPadManagement: React.FC = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<ScratchPadNewsletter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scratchPadApi.getAll(false);
      setNewsletters(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load newsletters");
      toast.error("Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await scratchPadApi.delete(deleteId);
      toast.success("Newsletter deleted successfully");
      setDeleteId(null);
      loadNewsletters();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to delete newsletter");
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/content/scratch-pad/${id}/edit`);
  };

  const handleView = (slug: string) => {
    navigate(`/user/app/scratch-pad/${slug}`);
  };

  const handleCreate = () => {
    navigate("/admin/content/scratch-pad/new");
  };

  const filtered = newsletters.filter((n) =>
    [n.title, n.description, n.author, ...(n.tags || [])]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const columns: ColDef[] = [
    {
      headerName: "Title",
      field: "title",
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Author",
      field: "author",
      flex: 1,
      minWidth: 120,
    },
    {
      headerName: "Published",
      field: "is_published",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <Badge variant={params.value ? "default" : "secondary"}>
          {params.value ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      headerName: "Date",
      field: "published_date",
      flex: 1,
      minWidth: 140,
      valueFormatter: (params: any) => {
        if (!params.value) return "Not published";
        return new Date(params.value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      headerName: "Tags",
      field: "tags",
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: any) => (
        <div className="flex gap-1 flex-wrap">
          {(params.value || []).slice(0, 2).map((tag: string, idx: number) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {(params.value || []).length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(params.value || []).length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: any) => (
        <div className="flex gap-2 mt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(params.data.id)}
          >
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(params.data.slug)}
          >
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteId(params.data.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Scratch Pad Newsletters
          </h1>
          <p className="text-muted-foreground">
            Manage blog-style newsletters for your users
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadNewsletters} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Newsletter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Newsletters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by title, author, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DataTable
            data={filtered}
            columns={columns}
            loading={loading}
            error={error || undefined}
            title="Newsletters"
            description={`${filtered.length} items`}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              newsletter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScratchPadManagement;
