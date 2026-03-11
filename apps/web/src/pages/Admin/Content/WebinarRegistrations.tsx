import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteWebinarRegistration, getWebinarRegistrations } from "@/api/webinar-registrations-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trash2, Users, Download } from "lucide-react";
import { queryKeys } from "@/api/queryKeys";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { confirmDelete } from "@/utils/confirm";

type WebinarRegistration = {
  id: string | number;
  created_at?: string;
  name: string;
  email: string;
  phone?: string | null;
  webinar_slug?: string | null;
};

function downloadCSV(data: WebinarRegistration[]) {
  if (data.length === 0) return;

  const toCSVValue = (v: any) =>
    `"${(v ?? "").toString().replace(/"/g, '""')}"`;

  const headers = [
    "id",
    "created_at",
    "name",
    "email",
    "phone",
    "webinar_slug",
  ];

  const csv =
    headers.join(",") +
    "\n" +
    data
      .map((row) => headers.map((key) => toCSVValue((row as any)[key])).join(","))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "webinar_registrations.csv";
  link.click();
}

const WebinarRegistrationsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<WebinarRegistration[]>({
    queryKey: [queryKeys.webinar_registrations],
    queryFn: () => getWebinarRegistrations(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteWebinarRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.webinar_registrations],
      });
      toast.success("Registration deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete registration");
    },
  });
  const handleDelete = async (item: WebinarRegistration) => {
    const label = item.email || item.name || `#${item.id}`;
    const ok = await confirmDelete(label);
    if (!ok) return;
    deleteMutation.mutate(item.id);
  };

  const items: WebinarRegistration[] = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter(
      (r) =>
        r.name?.toLowerCase().includes(lower) ||
        r.email?.toLowerCase().includes(lower) ||
        (r.phone && r.phone.toLowerCase().includes(lower)) ||
        (r.webinar_slug && r.webinar_slug.toLowerCase().includes(lower))
    );
  }, [data, search]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">Webinar Registrations</h1>
          <Badge variant="secondary">{items.length} registrations</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              minWidth: 180,
              outline: "none",
              borderColor: "#ddd",
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="flex items-center space-x-1"
            onClick={() => downloadCSV(items)}
            disabled={!items.length}
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download CSV</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Red Flags Webinar</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              Failed to load registrations.
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No registrations yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered At</TableHead>
                  <TableHead className="w-[120px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.phone || "-"}</TableCell>
                    <TableCell>
                      {item.created_at ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        title="Delete"
                        className="hover:bg-red-600 hover:text-white"
                        onClick={() => handleDelete(item)}
                        disabled={deleteMutation.isPending}
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

export default WebinarRegistrationsPage;

