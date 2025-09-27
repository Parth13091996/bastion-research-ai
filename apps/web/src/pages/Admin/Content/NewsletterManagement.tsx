import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mailchimpNewsletterApi } from "@/api/mailchimp";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCcw,
  Mail,
  Search,
  ExternalLink,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";

const MAILCHIMP_DASHBOARD_URL = import.meta.env.VITE_MAILCHIMP_MANAGE_URL as string | undefined;

const NewsletterManagement: React.FC = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNewsletters = useCallback(async (options?: { force?: boolean }) => {
    try {
      if (!options?.force) setIsLoading(true);
      const data = options?.force
        ? await mailchimpNewsletterApi.admin.refresh()
        : await mailchimpNewsletterApi.admin.getAll();
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNewsletters(sorted);
      if (options?.force) {
        toast.success("Mailchimp feed synced successfully");
      }
    } catch (error: any) {
      console.error("Failed to load Mailchimp newsletters", error);
      toast.error("Unable to load Mailchimp newsletters");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNewsletters();
  }, [loadNewsletters]);

  const filteredNewsletters = useMemo(() => {
    if (!searchQuery.trim()) return newsletters;
    const term = searchQuery.toLowerCase();
    return newsletters.filter((item) => {
      const matchesTitle = item.title?.toLowerCase().includes(term);
      const matchesSubtitle = item.sub_title?.toLowerCase().includes(term);
      const matchesBody = item.plain_text?.toLowerCase().includes(term);
      return Boolean(matchesTitle || matchesSubtitle || matchesBody);
    });
  }, [newsletters, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNewsletters({ force: true });
  };

  const handleView = (id: string) => {
    navigate(`/newsletters/${id}`);
  };

  const handleOpenMailchimp = (newsletter: Newsletter) => {
    if (newsletter.link) {
      window.open(newsletter.link, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("No Mailchimp archive link is available for this campaign");
  };

  const handleCreate = () => {
    if (MAILCHIMP_DASHBOARD_URL) {
      window.open(MAILCHIMP_DASHBOARD_URL, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Create newsletters directly from your Mailchimp dashboard.");
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return format(date, "MMM dd, yyyy");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading newsletters...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-3">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Mailchimp Newsletter Feed</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Campaigns created or edited in Mailchimp sync into the Bastion newsletters section.
              Use the refresh button to pull the latest RSS content whenever you make changes.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">{newsletters.length} items</Badge>
              <Badge variant="outline">Source: Mailchimp RSS</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={MAILCHIMP_DASHBOARD_URL ? "outline" : "secondary"}
            onClick={handleCreate}
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Open Mailchimp
          </Button>
          <Button onClick={handleRefresh} disabled={isRefreshing} className="bg-blue-500 hover:bg-blue-600 text-white">
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Syncing" : "Sync Latest"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mailchimp Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNewsletters.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-lg font-medium mb-1">No campaigns found</p>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term."
                  : "Create or update a campaign in Mailchimp, then sync again."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-[220px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNewsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate" title={newsletter.title}>
                        {newsletter.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-lg truncate text-sm text-muted-foreground" title={newsletter.sub_title || newsletter.plain_text}>
                        {newsletter.sub_title || newsletter.plain_text || "—"}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(newsletter.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(newsletter.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenMailchimp(newsletter)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Mailchimp
                        </Button>
                      </div>
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

export default NewsletterManagement;
