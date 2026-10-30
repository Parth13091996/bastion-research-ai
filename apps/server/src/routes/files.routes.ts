import optionalAuth from '../middleware/optionalAuth.middleware';
import { Router } from "express";
import { uploadFile } from "../controllers/files.controller";
import { upload } from "../services/multer.service";

const router = Router();

router.post("/upload", optionalAuth, upload.single("file"), uploadFile);

export default router;
