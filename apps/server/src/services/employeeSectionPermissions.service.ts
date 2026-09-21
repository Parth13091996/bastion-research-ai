import { supabase } from "../supabase";

export const ADMIN_SECTION_KEYS = [
  "ar_manage_members",
  "ar_profile",
  "ar_manage_plans",
  "ar_payment_history",
  "ar_coupon_management",
  "content_newsletter",
  "content_recommendations",
  "content_podcasts",
  "content_webinars",
  "content_webinar_registrations",
  "content_testimonials",
  "content_red_flag_analytics",
  "content_scratch_pad",
  "content_qna",
  "jobs_job_openings",
  "jobs_add_new_job",
  "jobs_applications",
  "leads",
] as const;

export type AdminSectionKey = (typeof ADMIN_SECTION_KEYS)[number];

export function isAdminSectionKey(value: string): value is AdminSectionKey {
  return (ADMIN_SECTION_KEYS as readonly string[]).includes(value);
}

export async function getEmployeeEditableSections(userId: string) {
  const { data, error } = await supabase
    .from("employee_section_permissions")
    .select("section_key")
    .eq("user_id", userId)
    .eq("can_edit", true);

  if (error) throw error;
  return (data || []).map((r: any) => String(r.section_key));
}

export async function canEmployeeEditSection(
  userId: string,
  sectionKey: AdminSectionKey
) {
  const { data, error } = await supabase
    .from("employee_section_permissions")
    .select("can_edit")
    .eq("user_id", userId)
    .eq("section_key", sectionKey)
    .maybeSingle();

  if (error) throw error;
  return data?.can_edit === true;
}

export async function upsertEmployeeSectionPermission(params: {
  userId: string;
  sectionKey: AdminSectionKey;
  canEdit: boolean;
}) {
  const { userId, sectionKey, canEdit } = params;
  const { data, error } = await supabase
    .from("employee_section_permissions")
    .upsert(
      {
        user_id: userId,
        section_key: sectionKey,
        can_edit: canEdit,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "user_id,section_key" }
    )
    .select("user_id, section_key, can_edit")
    .single();

  if (error) throw error;
  return data;
}
