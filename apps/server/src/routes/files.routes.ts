import { Router } from "express";
import multer from "multer";
import { uploadPdf } from "../controllers/files.controller";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_DOC_FILE_SIZE || 20 * 1024 * 1024), // default 20MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post("/upload", upload.single("file"), uploadPdf);

export default router;

