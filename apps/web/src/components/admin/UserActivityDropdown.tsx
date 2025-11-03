import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PageVisit {
  path: string;
  title: string;
  visits: number;
}

interface RecommendationVisit {
  recommendation_id: string;
  recommendation_title: string;
  visits: number;
}

interface UserActivityDropdownProps {
  userId: string;
  pageViewsCount: number;
  recommendationsCount: number;
}

export const UserActivityDropdown = ({
  userId,
  pageViewsCount,
  recommendationsCount,
}: UserActivityDropdownProps) => {
  const [open, setOpen] = useState(false);

  // Fetch page visits when dropdown is opened
  const { data: pageVisits, isLoading: loadingPages } = useQuery<PageVisit[]>({
    queryKey: ["user-page-visits", userId],
    queryFn: () =>
      axiosInstance
        .get(`/api/admin/users/${userId}/page-visits`)
        .then((res) => res.data),
    enabled: open,
  });

  // Fetch recommendation visits when dropdown is opened
  const { data: recVisits, isLoading: loadingRecs } = useQuery<
    RecommendationVisit[]
  >({
    queryKey: ["user-recommendation-visits", userId],
    queryFn: () =>
      axiosInstance
        .get(`/api/admin/users/${userId}/recommendation-visits`)
        .then((res) => res.data),
    enabled: open,
  });

  const hasData = pageViewsCount > 0 || recommendationsCount > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          disabled={!hasData}
        >
          View Details
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        {/* Page Visits Section */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Page Visits
          </span>
          <Badge variant="secondary">{pageViewsCount}</Badge>
        </DropdownMenuLabel>
        {loadingPages ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : pageVisits && pageVisits.length > 0 ? (
          <div className="max-h-48 overflow-y-auto">
            {pageVisits.map((visit, idx) => (
              <DropdownMenuItem
                key={`${visit.path}-${idx}`}
                className="flex flex-col items-start cursor-default"
              >
                <div className="font-medium text-sm truncate w-full">
                  {visit.title || visit.path}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-between w-full">
                  <span className="truncate flex-1">{visit.path}</span>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {visit.visits}x
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            No page visits recorded
          </div>
        )}

        <DropdownMenuSeparator />

        {/* Recommendation Visits Section */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center">
            <Star className="mr-2 h-4 w-4" />
            Recommendations
          </span>
          <Badge variant="secondary">{recommendationsCount}</Badge>
        </DropdownMenuLabel>
        {loadingRecs ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : recVisits && recVisits.length > 0 ? (
          <div className="max-h-48 overflow-y-auto">
            {recVisits.map((visit) => (
              <DropdownMenuItem
                key={visit.recommendation_id}
                className="flex items-center justify-between cursor-default"
              >
                <span className="text-sm truncate flex-1">
                  {visit.recommendation_title}
                </span>
                <Badge variant="outline" className="ml-2 shrink-0">
                  {visit.visits}x
                </Badge>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="px-2 py-2 text-sm text-muted-foreground">
            No recommendations accessed
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
