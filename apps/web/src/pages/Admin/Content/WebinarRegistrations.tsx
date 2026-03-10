import { useQuery } from "@tanstack/react-query";
import { getWebinarRegistrations } from "@/api/webinar-registrations-api";
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
import { Calendar, Users } from "lucide-react";
import { queryKeys } from "@/api/queryKeys";

type WebinarRegistration = {
  id: string | number;
  created_at?: string;
  name: string;
  email: string;
  phone?: string | null;
  webinar_slug?: string | null;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

const WebinarRegistrationsPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<WebinarRegistration[]>({
    queryKey: [queryKeys.webinar_registrations],
    queryFn: () => getWebinarRegistrations(),
  });

  const items = data || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">Webinar Registrations</h1>
          <Badge variant="secondary">{items.length} registrations</Badge>
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
                  <TableHead>Source</TableHead>
                  <TableHead>UTM</TableHead>
                  <TableHead>Registered At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.phone || "-"}</TableCell>
                    <TableCell>{item.source || item.webinar_slug || "-"}</TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-600 space-y-1">
                        {item.utm_source && (
                          <div>source: {item.utm_source}</div>
                        )}
                        {item.utm_medium && (
                          <div>medium: {item.utm_medium}</div>
                        )}
                        {item.utm_campaign && (
                          <div>campaign: {item.utm_campaign}</div>
                        )}
                        {!item.utm_source &&
                          !item.utm_medium &&
                          !item.utm_campaign && <span>-</span>}
                      </div>
                    </TableCell>
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

