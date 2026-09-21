import { Router } from "express";
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
} from "../controllers/application.controller";
import { upload } from "../services/multer.service";
import { protect, requireSectionEdit, staff } from "../middleware/auth.middleware";

const router = Router();

router.get("/applications", protect, staff, getApplications);
router.post("/applications", upload.single("resume"), createApplication);
router.put("/applications/:id", protect, staff, requireSectionEdit("jobs_applications"), updateApplication);
router.delete("/applications/:id", protect, staff, requireSectionEdit("jobs_applications"), deleteApplication);

export default router;
