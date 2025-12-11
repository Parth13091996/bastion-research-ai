import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, RefreshCw, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { newsletterApi } from "@/api/content";
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

const NewsletterManagement: React.FC = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
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
      const data = await newsletterApi.admin.getAll();
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
      await newsletterApi.admin.delete(deleteId);
      toast.success("Newsletter deleted successfully");
      setDeleteId(null);
      loadNewsletters();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to delete newsletter");
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/content/newsletters/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/newsletters/${id}`);
  };

  const handleCreate = () => {
    navigate("/admin/content/newsletters/create");
  };

  const filtered = newsletters.filter((n) =>
    [n.title, n.sub_title, n.category, n.author, n.link]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletters</h1>
          <p className="text-muted-foreground">
            Manage newsletters stored in Supabase
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={loadNewsletters}
            disabled={loading}
            className="text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4 text-white" /> Refresh
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
              placeholder="Search by title, category, or author..."
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
              <h3 className="text-lg font-medium mb-2">No newsletters found</h3>
              <p className="text-gray-600 mb-4">
                {search
                  ? "Try adjusting your search"
                  : "Get started by creating your first newsletter"}
              </p>
              {!search && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Newsletter
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[220px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell className="font-medium">
                      <div
                        className="max-w-xs truncate"
                        title={newsletter.title}
                      >
                        {newsletter.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {newsletter.category || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600">
                        {newsletter.author || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(newsletter.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        title="View"
                        className="hover:bg-blue-100 hover:text-blue-600"
                        onClick={() => handleView(newsletter.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Edit"
                        className="hover:bg-yellow-100 hover:text-yellow-600"
                        onClick={() => handleEdit(newsletter.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        title="Delete"
                        className="hover:bg-red-600 hover:text-white"
                        onClick={() => setDeleteId(newsletter.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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

export default NewsletterManagement;

