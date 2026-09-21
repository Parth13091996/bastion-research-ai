import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_FILE_SIZE || 25 * 1024 * 1024), // default 25MB
    files: 10,
  },
});
