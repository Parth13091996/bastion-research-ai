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

/**
 * Persist a base64 encoded signature image to Supabase storage.
 * - Expects JSON payload: { dataUrl: string, identifier?: string }
 * - Accepts common image MIME types (PNG/JPEG/WebP)
 */
export async function uploadSignature(req: Request, res: Response) {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
    const { dataUrl } = req.body as { dataUrl?: string };

    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ message: "dataUrl is required" });
    }

    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res
        .status(400)
        .json({ message: "Signature dataUrl must be a base64 encoded image" });
    }

    const mimeType = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, "base64");
    const extension = mimeType.split("/")[1] || "png";
    const filename = `signatures/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ message: uploadError.message });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filename);

    return res.status(201).json({ url: publicUrl, path: filename });
  } catch (e: any) {
    console.error("Signature upload error", e);
    return res
      .status(500)
      .json({ message: e?.message || "Failed to store signature" });
  }
}
