import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getApplications = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("applications").select("*, job_openings(job_title)")
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

    // Convert file to base64 for storage
    const resume_base64 = file.buffer.toString('base64');
    const resume_mimetype = file.mimetype;

    // For now, we'll store the file as base64 in the database
    // In a production environment, you might want to upload to a cloud storage service
    const resume_url = `data:${resume_mimetype};base64,${resume_base64}`;

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
  const { job_id, applicant_name, status, email, phone, cover_letter, comments } = req.body ?? {};
  const { data, error } = await supabase
    .from("applications")
    .update({ job_id, applicant_name, status, email, phone, cover_letter, comments })
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
