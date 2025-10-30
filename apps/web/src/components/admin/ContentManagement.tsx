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
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Music,
  Video,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { confirmDelete } from "@/utils/confirm";
import { format } from "date-fns";

export type ContentType =
  | "newsletters"
  | "webinars"
  | "podcasts"
  | "scratch-pad";

interface ContentItem {
  id: string;
  title: string;
  sub_title?: string;
  headline_image_url?: string;
  html_content?: string;
  footer_content?: string;
  video_url?: string;
  created_at: string;
  is_premium?: boolean; // Added for webinars
  category?: string; // Added for newsletters
}

interface ContentManagementProps {
  type: ContentType;
  title: string;
  api: {
    getAll: () => Promise<ContentItem[]>;
    delete: (id: string) => Promise<{ message: string }>;
  };
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  tableHeaderColumns?: string[];
}

const ContentManagement: React.FC<ContentManagementProps> = ({
  type,
  title,
  api,
  tableHeaderColumns,
  onEdit,
  onView,
}) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
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
      const data = await api.getAll();
      setItems(data);
    } catch (error: any) {
      toast.error("Failed to load items");
      console.error("Error loading items:", error);
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
    const ok = await confirmDelete(title);
    if (!ok) return;
    try {
      await api.delete(id);
      toast.success("Item deleted successfully");
      loadItems();
    } catch (error: any) {
      toast.error("Failed to delete item");
      console.error("Error deleting item:", error);
    }
  };

  const handleCreate = () => {
    navigate(`/admin/content/${type}/create`);
  };

  const getTypeIcon = () => {
    switch (type) {
      case "newsletters":
        return <Mail className="h-6 w-6 text-blue-500" />;
      case "webinars":
        return <Video className="h-6 w-6 text-red-500" />;
      case "podcasts":
        return <Music className="h-6 w-6 text-green-500" />;
      default:
        return "📄";
    }
  };

  const formatDate = (dateString: string) =>
    format(new Date(dateString), "MMM dd, yyyy");

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
          <span>{getTypeIcon()}</span>
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge variant="secondary">{filteredItems.length} items</Badge>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={`Search ${type}s...`}
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
          <CardTitle>All {title}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">{getTypeIcon()}</div>
              <h3 className="text-lg font-medium mb-2">No {type}s found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : `Get started by creating your first ${type}`}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleCreate}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  {/* {type === "newsletters" && <TableHead>Sub Title</TableHead>}
                  {type === "newsletters" && <TableHead>Category</TableHead>}
                  {type === "webinars" && <TableHead></TableHead>} */}
                  {tableHeaderColumns.map((headerColumn) => (
                    <TableHead>{headerColumn}</TableHead>
                  ))}
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

                    {type === "newsletters" && (
                      <TableCell>
                        <div
                          className="max-w-xs truncate text-gray-600"
                          title={item.sub_title}
                        >
                          {item.sub_title || "-"}
                        </div>
                      </TableCell>
                    )}

                    {type === "newsletters" && (
                      <TableCell>
                        <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-700">
                          {item.category
                            ? item.category
                                .replace("-", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                            : "-"}
                        </span>
                      </TableCell>
                    )}

                    {type === "webinars" && (
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-white ${item.is_premium ? "bg-green-500" : "bg-gray-500"}`}
                        >
                          {item.is_premium ? "Premium" : "Free"}
                        </span>
                      </TableCell>
                    )}

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
                        onClick={() => onView(item.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Edit"
                        className="hover:bg-yellow-100 hover:text-yellow-600"
                        onClick={() => onEdit(item.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        title="Delete"
                        className="hover:bg-red-600 hover:text-white"
                        onClick={() => handleDelete(item.id, item.title)}
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
    </div>
  );
};

export default ContentManagement;
