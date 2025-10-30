import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/files.controller";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_DOC_FILE_SIZE || 20 * 1024 * 1024), // default 20MB
    files: 1,
  },
});

router.post("/upload", upload.single("file"), uploadFile);

export default router;
