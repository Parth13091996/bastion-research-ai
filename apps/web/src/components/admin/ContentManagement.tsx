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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export type ContentType = "newsletters" | "webinars" | "podcasts";

interface ContentItem {
  id: string;
  title: string;
  sub_title?: string;
  headline_image_url?: string;
  html_content?: string;
  footer_content?: string;
  video_url?: string;
  created_at: string;
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
}

const ContentManagement: React.FC<ContentManagementProps> = ({
  type,
  title,
  api,
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
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

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
        return "📧";
      case "webinars":
        return "🎥";
      case "podcasts":
        return "🎧";
      default:
        return "📄";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  if (isLoading) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon()}</span>
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge variant="secondary">{filteredItems.length} items</Badge>
        </div>
        <Button onClick={handleCreate}>
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
                <Button onClick={handleCreate}>
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
                  {type === "newsletters" && <TableHead>Sub Title</TableHead>}
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
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
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.created_at)}
                      </div>
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
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(item.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id, item.title)}
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

export default ContentManagement;
