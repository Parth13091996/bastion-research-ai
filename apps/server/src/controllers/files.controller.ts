import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { supabase } from "../supabase";

export async function uploadFile(req: Request, res: Response) {
  try {
    const bucket = process.env.SUPABASE_FILE_STORAGE_BUCKET || "files";

    const file = (req as any)?.file as Express.Multer.File | undefined;
    console.log({ type: file?.mimetype });
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const filename = `${randomUUID()}.${file?.mimetype}`;
    const storagePath = `${filename}`;

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
