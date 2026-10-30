import type { Request, Response } from "express";
import { uploadToSupabase } from "../services/upload.service";

// Unified upload controller: handles images, pdfs, and documents for all features
export async function uploadFile(req: Request, res: Response) {
  try {
    const file = (req as any)?.file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const category = (req.body.category as any) || undefined; // optional hint
    const dir = (req.body.dir as string) || undefined; // optional subfolder
    if(/^(recommendations|tactical|scratchpad)(?:\/|$)/.test(dir||'') && !((req as any).user?.status==='active' && ['admin','employee'].includes((req as any).user?.role)))return res.status(403).json({error:'Staff access required for research uploads'});
    const fileNameBase = (req.body.fileName as string) || undefined;

    const result = await uploadToSupabase({
      file,
      category,
      dir,
      filenameBase: fileNameBase,
    });
    return res.status(201).json(result);
  } catch (e: any) {
    console.error("uploadFile error:", e?.message || e);
    return res.status(400).json({ error: e?.message || "Upload failed" });
  }
}
