import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Eye, Edit, Trash2, Calendar, Music } from "lucide-react";
import { toast } from "sonner";
import { formatAdminDate } from "@/lib/utils";
import { podcastApi } from "@/api/content";
import { confirmDelete } from "@/utils/confirm";
import { useSectionEditAccess } from "@/hooks/use-section-edit-access";

interface PodcastItem {
  id: string;
  title: string;
  sub_title?: string;
  headline_image_url?: string;
  html_content?: string;
  footer_content?: string;
  created_at: string;
}

const PodcastManagement: React.FC = () => {
  const navigate = useNavigate();
  const { canEdit } = useSectionEditAccess("content_podcasts");
  const [items, setItems] = useState<PodcastItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PodcastItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await podcastApi.getAll();
      setItems(data as any);
    } catch (error: any) {
      toast.error("Failed to load podcasts");
      console.error("Error loading podcasts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sub_title &&
          item.sub_title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredItems(filtered);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!canEdit) return;
    const ok = await confirmDelete(title);
    if (!ok) return;
    try {
      await podcastApi.delete(id);
      toast.success("Podcast deleted successfully");
      loadItems();
    } catch (error: any) {
      toast.error("Failed to delete podcast");
      console.error("Error deleting podcast:", error);
    }
  };

  const handleEdit = (id: string) => {
    if (!canEdit) return;
    navigate(`/admin/content/podcasts/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/podcasts/${id}`);
  };

  const handleCreate = () => {
    if (!canEdit) return;
    navigate("/admin/content/podcasts/create");
  };

  const formatDate = (dateString: string) => formatAdminDate(dateString);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Music className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold">Podcast Management</h1>
          <Badge variant="secondary">{filteredItems.length} podcasts</Badge>
        </div>
        {canEdit && (
          <Button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Podcast
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search podcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Podcasts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No podcasts found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Get started by creating your first podcast"}
              </p>
              {!searchQuery && canEdit && (
                <Button
                  onClick={handleCreate}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Podcast
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Sub Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[220px] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate" title={item.title}>
                        {item.title}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        className="max-w-xs truncate text-gray-600"
                        title={item.sub_title}
                      >
                        {item.sub_title || "-"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.created_at)}
                      </div>
                    </TableCell>

                    <TableCell className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        title="View"
                        className="hover:bg-blue-100 hover:text-blue-600"
                        onClick={() => handleView(item.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          title="Edit"
                          className="hover:bg-yellow-100 hover:text-yellow-600"
                          onClick={() => handleEdit(item.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="destructive"
                          title="Delete"
                          className="hover:bg-red-600 hover:text-white"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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

export default PodcastManagement;
