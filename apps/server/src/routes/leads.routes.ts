import { Router } from "express";
import { deleteLead, listLeads, updateLead } from "../controllers/leads.controller";
import { protect, requireSectionEdit, staff } from "../middleware/auth.middleware";

const router = Router();

router.get("/leads", protect, staff, listLeads);
router.put("/leads/:id", protect, staff, requireSectionEdit("leads"), updateLead);
router.delete("/leads/:id", protect, staff, requireSectionEdit("leads"), deleteLead);

export default router;
