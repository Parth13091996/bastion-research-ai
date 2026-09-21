import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import type { AdminEditSectionKey } from "@/utils/admin-sections";

export type EmployeeEditAccessRow = {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  status?: string;
  editable_sections?: string[];
};

export async function getMySectionEditAccess() {
  const { data } = await axiosInstance.get(endpoints.staff.sectionEditAccess);
  return data as { editable_sections: string[] };
}

export async function adminListEmployeesSectionEditAccess() {
  const { data } = await axiosInstance.get(
    endpoints.admin.staff.sectionEditAccess
  );
  return data as { employees: EmployeeEditAccessRow[] };
}

export async function adminSetEmployeeSectionEditAccess(params: {
  userId: string;
  sectionKey: AdminEditSectionKey;
  canEdit: boolean;
}) {
  const { userId, sectionKey, canEdit } = params;
  const { data } = await axiosInstance.put(
    endpoints.admin.staff.sectionEditAccess,
    {
      user_id: userId,
      section_key: sectionKey,
      can_edit: canEdit,
    }
  );
  return data as {
    permission: { user_id: string; section_key: string; can_edit: boolean };
  };
}

