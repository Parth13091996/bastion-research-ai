import { Router } from "express";
import { deleteLead, listLeads, updateLead } from "../controllers/leads.controller";

const router = Router();

router.get("/leads", listLeads);
router.put("/leads/:id", updateLead);
router.delete("/leads/:id", deleteLead);

export default router;

