import { randomUUID } from "crypto";
import path from "path";
import { supabase } from "../supabase";

export type UploadCategory = "image" | "pdf" | "resume" | "doc" | "file";

function getExtFromMimetype(mime: string, fallback?: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
  };
  return map[mime] || fallback || "bin";
}

function pickBucket(category?: UploadCategory) {
  switch (category) {
    case "resume":
    case "doc":
      return process.env.SUPABASE_RESUME_STORAGE_BUCKET || "resumes";
    case "image":
    case "pdf":
    case "file":
    default:
      return process.env.SUPABASE_FILE_STORAGE_BUCKET || "files";
  }
}

function inferCategory(mime?: string): UploadCategory {
  if (!mime) return "file";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "doc";
  return "file";
}

function validateMimetype(mime: string, category: UploadCategory) {
  const allowed: Record<UploadCategory, string[]> = {
    image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"],
    pdf: ["application/pdf"],
    resume: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    doc: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    file: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/jpg",
    ],
  };
  const list = allowed[category] || allowed.file;
  return list.includes(mime);
}

export async function uploadToSupabase({
  file,
  category: categoryProp,
  dir,
  filenameBase,
  upsert = true,
}: {
  file: Express.Multer.File;
  category?: UploadCategory;
  dir?: string; // e.g., "recommendations" or "resumes"
  filenameBase?: string; // optional base name without extension
  upsert?: boolean;
}) {
  const category = categoryProp || inferCategory(file.mimetype);

  if (!validateMimetype(file.mimetype, category)) {
    throw new Error("Unsupported file type for this category");
  }

  const bucket = pickBucket(category);
  const ext = getExtFromMimetype(
    file.mimetype,
    path.extname(file.originalname).slice(1)
  );
  const filename = `${filenameBase || randomUUID()}.${ext}`;
  const subdir = dir || category;
  const storagePath = `${subdir}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });
  if (uploadError) throw new Error(uploadError.message || "Upload failed");

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return {
    bucket,
    path: storagePath,
    url: publicUrl,
    contentType: file.mimetype,
    size: file.size,
    category,
  };
}
