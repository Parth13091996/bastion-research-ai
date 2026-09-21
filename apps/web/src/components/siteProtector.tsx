import { getMySectionEditAccess } from "@/api/section-edit-access-api";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminEditSectionKey } from "@/utils/admin-sections";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function hasAccessToPath(
  pathname: string,
  editableSections: string[],
  isAdmin: boolean,
  isEmployee: boolean
): boolean {
  if (isAdmin) return true;
  if (!isEmployee) return false;

  // If employee has a wildcard permission, they have access to everything
  if (editableSections.includes("*")) return true;

  // Map pathname to section keys
  let requiredSection: AdminEditSectionKey | null = null;

  if (pathname.startsWith("/admin/ar/members") || pathname.startsWith("/admin/users/all")) {
    requiredSection = "ar_manage_members";
  } else if (pathname.startsWith("/admin/users/profile")) {
    requiredSection = "ar_profile";
  } else if (pathname.startsWith("/admin/ar/plans")) {
    requiredSection = "ar_manage_plans";
  } else if (pathname.startsWith("/admin/ar/payments")) {
    requiredSection = "ar_payment_history";
  } else if (pathname.startsWith("/admin/ar/coupons")) {
    requiredSection = "ar_coupon_management";
  } else if (pathname.startsWith("/admin/content/newsletters")) {
    requiredSection = "content_newsletter";
  } else if (pathname.startsWith("/admin/content/recommendations")) {
    requiredSection = "content_recommendations";
  } else if (pathname.startsWith("/admin/content/podcasts")) {
    requiredSection = "content_podcasts";
  } else if (pathname.startsWith("/admin/content/webinars")) {
    requiredSection = "content_webinars";
  } else if (pathname.startsWith("/admin/content/webinar-registrations")) {
    requiredSection = "content_webinar_registrations";
  } else if (pathname.startsWith("/admin/content/testimonials")) {
    requiredSection = "content_testimonials";
  } else if (pathname.startsWith("/admin/content/red-flag-analytics")) {
    requiredSection = "content_red_flag_analytics";
  } else if (pathname.startsWith("/admin/content/scratch-pad")) {
    requiredSection = "content_scratch_pad";
  } else if (pathname.startsWith("/admin/content/qna")) {
    requiredSection = "content_qna";
  } else if (pathname.startsWith("/admin/jobs/openings")) {
    requiredSection = "jobs_job_openings";
  } else if (pathname.startsWith("/admin/jobs/add")) {
    requiredSection = "jobs_add_new_job";
  } else if (pathname.startsWith("/admin/jobs/applications")) {
    requiredSection = "jobs_applications";
  } else if (pathname.startsWith("/admin/leads")) {
    requiredSection = "leads";
  }

  // If the path requires a specific section permission, check if the employee has it
  if (requiredSection) {
    return editableSections.includes(requiredSection);
  }

  // If they are on an admin page that does not require a specific permission (like /admin or /admin/dashboard),
  // we allow copy-paste for employees by default.
  if (pathname.startsWith("/admin")) {
    return true;
  }

  // For any non-admin pages (client/public/subscriber pages), employee should be restricted just like other users
  // (to prevent leakage of premium content through employee accounts if not in admin context).
  return false;
}

const SiteProtector = () => {
  const { isAdmin, isEmployee } = useAuth();
  const location = useLocation();

  const { data } = useQuery({
    queryKey: [queryKeys.staff_section_edit_access],
    queryFn: getMySectionEditAccess,
    enabled: isEmployee && !isAdmin,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const editableSections = data?.editable_sections || [];
  const hasAccess = hasAccessToPath(
    location.pathname,
    editableSections,
    isAdmin,
    isEmployee
  );

  useEffect(() => {
    if (hasAccess) return; // Allow copy-paste, selection, context menu if they have access

    // Helper to check if event target is inside AG Grid
    const isGrid = (target: EventTarget | null) =>
      target instanceof Element && target.closest(".ag-root");

    const disableContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const disableDrag = (e: Event) => e.preventDefault();

    const disableSelection = (e: Event) => {
      // Allow selection within AG Grid
      if (isGrid(e.target)) return;
      e.preventDefault();
    };

    const blockShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const target = e.target as HTMLElement;

      const isGridInteract = isGrid(target);

      // Block Saving (Ctrl+S), Print (Ctrl+P), etc.
      if (e.ctrlKey && ["s", "p", "a"].includes(key)) {
        e.preventDefault();
        return;
      }

      // Copy/Cut/Paste
      if (e.ctrlKey && ["c", "x", "v"].includes(key)) {
        // Allow Copy in Grid
        if (key === "c" && isGridInteract) return;

        e.preventDefault();
        return;
      }

      // Mac specific (Meta)
      if (e.metaKey && ["s", "p", "a", "c", "x", "v"].includes(key)) {
        if (key === "c" && isGridInteract) return;
        e.preventDefault();
        return;
      }
    };

    // Apply global restrictions
    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("dragstart", disableDrag);
    document.addEventListener("selectstart", disableSelection);
    document.addEventListener("keydown", blockShortcuts);

    const style = document.createElement("style");
    style.innerHTML = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      /* Allow selection in grid cells */
      .ag-cell, .ag-cell-value {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("dragstart", disableDrag);
      document.removeEventListener("selectstart", disableSelection);
      document.removeEventListener("keydown", blockShortcuts);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [hasAccess]);

  return null;
};

export default SiteProtector;
