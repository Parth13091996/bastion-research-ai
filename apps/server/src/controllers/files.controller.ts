import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { supabase } from "../supabase";

/**
 * Upload a single PDF file to Supabase Storage and return its public URL.
 * - Expects multipart/form-data with field name `file`.
 * - Stores under path: `docs/<uuid>.pdf` in the configured bucket.
 */
export async function uploadPdf(req: Request, res: Response) {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";

    const file = (req as any)?.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    const filename = `${randomUUID()}.pdf`;
    const storagePath = `docs/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    return res.status(201).json({ url: publicUrl, path: storagePath });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Upload failed" });
  }
}
