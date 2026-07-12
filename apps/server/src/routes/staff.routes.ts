import { Router } from "express";
import { protect, staff } from "../middleware/auth.middleware";
import { getMySectionEditAccess } from "../controllers/employeeSectionPermissions.controller";

const router = Router();

router.get("/staff/section-edit-access", protect, staff, getMySectionEditAccess);

export default router;

