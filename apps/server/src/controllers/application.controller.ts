import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { supabase } from "../supabase";

export const getApplications = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("applications")
    .select("*, job_openings(job_title)");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    const {
      job_id,
      applicant_name,
      email,
      phone,
      cover_letter,
      status = "Pending",
      comments,
    } = req.body ?? {};

    // Get the uploaded file from multer
    const file = (req as any).file;

    // Validate required fields
    if (!job_id) {
      return res.status(400).json({ error: "job_id is required" });
    }
    if (!applicant_name) {
      return res.status(400).json({ error: "applicant_name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }
    if (!file) {
      return res.status(400).json({ error: "resume file is required" });
    }

    const bucket = process.env.SUPABASE_RESUME_STORAGE_BUCKET || "resumes";
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ error: "Only PDF, DOC, or DOCX files allowed" });
    }

    const ext =
      file.mimetype === "application/pdf"
        ? "pdf"
        : file.mimetype === "application/msword"
          ? "doc"
          : "docx";
    const filename = `${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filename);

    const resume_url = publicUrl;

    const { data, error } = await supabase
      .from("applications")
      .insert([
        {
          job_id: parseInt(job_id),
          applicant_name,
          email,
          phone,
          cover_letter,
          resume_url,
          status,
          comments,
        },
      ])
      .select();
    const { data: currentJobOpening } = await supabase
      .from("job_openings")
      .select("*")
      .eq("job_id", parseInt(job_id))
      .maybeSingle();
    console.log(currentJobOpening, job_id, "current");
    await supabase
      .from("job_openings")
      .update({
        applications: (currentJobOpening.applications || 0) + 1,
      })
      .eq("job_id", parseInt(job_id))
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Application creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    job_id,
    applicant_name,
    status,
    email,
    phone,
    cover_letter,
    comments,
  } = req.body ?? {};
  const { data, error } = await supabase
    .from("applications")
    .update({
      job_id,
      applicant_name,
      status,
      email,
      phone,
      cover_letter,
      comments,
    })
    .eq("application_id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const deleteApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("applications")
    .delete()
    .eq("application_id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};
