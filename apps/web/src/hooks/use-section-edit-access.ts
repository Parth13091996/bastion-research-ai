import { getMySectionEditAccess } from "@/api/section-edit-access-api";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminEditSectionKey } from "@/utils/admin-sections";
import { useQuery } from "@tanstack/react-query";

export function useSectionEditAccess(sectionKey: AdminEditSectionKey) {
  const { isAdmin, isEmployee } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKeys.staff_section_edit_access],
    queryFn: getMySectionEditAccess,
    enabled: isEmployee && !isAdmin,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const editable = data?.editable_sections || [];
  const canEdit =
    isAdmin ||
    (isEmployee &&
      (editable.includes("*") || editable.includes(String(sectionKey))));

  return { canEdit, isLoading: isEmployee ? isLoading : false, error };
}

