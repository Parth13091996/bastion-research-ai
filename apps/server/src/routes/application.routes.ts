import { Router } from "express";
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
} from "../controllers/application.controller";
import { upload } from "../services/multer.service";

const router = Router();

router.get("/applications", getApplications);
router.post("/applications", upload.single("resume"), createApplication);
router.put("/applications/:id", updateApplication);
router.delete("/applications/:id", deleteApplication);

export default router;
