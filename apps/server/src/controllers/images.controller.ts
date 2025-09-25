import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { supabase } from "../supabase";

/**
 * Upload a single image file to Supabase Storage and return its public URL.
 * - Expects multipart/form-data with field name `file`.
 * - Stores under path: `images/<uuid>.<ext>` in the configured bucket.
 */
export async function uploadImage(req: Request, res: Response) {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";

    // `multer` places the uploaded file on `req.file` when using single("file")
    const file = (req as any)?.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Basic type guard for images
    const isImage = /^image\//.test(file.mimetype);
    if (!isImage) {
      return res.status(400).json({ error: "Only image files are allowed" });
    }

    const ext = file.originalname.includes(".")
      ? file.originalname.split(".").pop()!.toLowerCase()
      : file.mimetype.replace("image/", "");

    const filename = `${randomUUID()}.${ext}`;
    // Store within an `images/` folder key as requested
    const storagePath = `images/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    // Build a public URL (bucket should be set to public for this to work without signed URLs)
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    return res.status(201).json({ url: publicUrl, path: storagePath });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Upload failed" });
  }
}
