import { Request, Response } from "express";
import { supabase } from "../supabase";
import {
  getEmployeeEditableSections,
  isAdminSectionKey,
  upsertEmployeeSectionPermission,
} from "../services/employeeSectionPermissions.service";

export const getMySectionEditAccess = async (req: any, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.user.role === "admin") {
      // Admin always has full edit access; client can treat admin as full access.
      return res.status(200).json({ editable_sections: ["*"] });
    }

    if (req.user.role !== "employee") {
      return res.status(200).json({ editable_sections: [] });
    }

    const editableSections = await getEmployeeEditableSections(req.user.id);
    return res.status(200).json({ editable_sections: editableSections });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load permissions" });
  }
};

export const listEmployeesSectionEditAccess = async (
  _req: Request,
  res: Response
) => {
  try {
    const { data: employees, error: employeesError } = await supabase
      .from("users")
      .select("id, username, first_name, last_name, email, role, status")
      .eq("role", "employee")
      .order("created_at", { ascending: false });

    if (employeesError) {
      return res.status(500).json({ message: "Failed to load employees" });
    }

    const userIds = (employees || []).map((u: any) => u.id).filter(Boolean);
    const editableByUserId: Record<string, string[]> = {};

    if (userIds.length > 0) {
      const { data: perms, error: permsError } = await supabase
        .from("employee_section_permissions")
        .select("user_id, section_key")
        .in("user_id", userIds)
        .eq("can_edit", true);

      if (permsError) {
        return res.status(500).json({ message: "Failed to load permissions" });
      }

      for (const row of perms || []) {
        const userId = String((row as any).user_id);
        const sectionKey = String((row as any).section_key);
        if (!editableByUserId[userId]) editableByUserId[userId] = [];
        editableByUserId[userId].push(sectionKey);
      }
    }

    const payload = (employees || []).map((u: any) => ({
      ...u,
      editable_sections: editableByUserId[String(u.id)] || [],
    }));

    return res.status(200).json({ employees: payload });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load data" });
  }
};

export const setEmployeeSectionEditAccess = async (
  req: Request,
  res: Response
) => {
  try {
    const { user_id, section_key, can_edit } = req.body as {
      user_id?: string;
      section_key?: string;
      can_edit?: boolean;
    };

    if (!user_id || !section_key || typeof can_edit !== "boolean") {
      return res.status(400).json({ message: "Invalid payload" });
    }

    if (!isAdminSectionKey(section_key)) {
      return res.status(400).json({ message: "Invalid section key" });
    }

    const updated = await upsertEmployeeSectionPermission({
      userId: user_id,
      sectionKey: section_key,
      canEdit: can_edit,
    });

    return res.status(200).json({ permission: updated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update permission" });
  }
};

