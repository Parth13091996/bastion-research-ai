import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { testimonialApi } from "@/api/content";

interface TestimonialItem {
  id: string;
  title: string;
  review: string;
  name: string;
  position: string;
  created_at: string;
}

const TestimonialManagement: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TestimonialItem[]>([]);
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
      const data = await testimonialApi.getAll();
      setItems(data);
    } catch (error: any) {
      toast.error("Failed to load testimonials");
      console.error("Error loading testimonials:", error);
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
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await testimonialApi.delete(id);
      toast.success("Testimonial deleted successfully");
      loadItems();
    } catch (error: any) {
      toast.error("Failed to delete testimonial");
      console.error("Error deleting testimonial:", error);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/content/testimonials/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/testimonials#${id}`);
  };

  const handleCreate = () => {
    navigate("/admin/content/testimonials/create");
  };

  const formatDate = (dateString: string) =>
    format(new Date(dateString), "MMM dd, yyyy");

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
          <Star className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">Testimonial Management</h1>
          <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-700">
            {filteredItems.length} testimonials
          </span>
        </div>
        <Button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search testimonials..."
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
          <CardTitle>All Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No testimonials found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Get started by adding your first testimonial"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Testimonial
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Text</TableHead>
                  <TableHead className="w-[220px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.created_at)}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate" title={item.name}>
                        {item.name}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs truncate text-gray-600" title={item.position}>
                        {item.position}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs truncate" title={item.title}>
                        {item.title}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-xs truncate text-gray-600" title={item.text}>
                        {item.text}
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
                      <Button
                        size="sm"
                        variant="outline"
                        title="Edit"
                        className="hover:bg-yellow-100 hover:text-yellow-600"
                        onClick={() => handleEdit(item.id)}
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

export default TestimonialManagement;
