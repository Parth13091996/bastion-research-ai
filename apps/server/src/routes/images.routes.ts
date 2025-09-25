import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/images.controller";

const router = Router();

// Multer in-memory storage; we forward the buffer to Supabase
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_IMAGE_FILE_SIZE || 5 * 1024 * 1024), // default 5MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/upload", upload.single("file"), uploadImage);

export default router;

