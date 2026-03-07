import { Request, Response } from "express";
import { supabase } from "../supabase";
import { uploadToSupabase } from "../services/upload.service";

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
    let {
      job_id,
      applicant_name,
      email,
      phone,
      cover_letter,
      status = "Pending",
      comments,
    } = req.body ?? {};
    
    email = email?.trim();
    phone = phone?.trim();

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

    // Check if the user has already applied for this job with the same email
    const { data: existingEmailApp } = await supabase
      .from("applications")
      .select("application_id")
      .eq("job_id", parseInt(job_id))
      .eq("email", email)
      .limit(1);

    if (existingEmailApp && existingEmailApp.length > 0) {
      return res.status(400).json({ error: "An application with this email already exists for this position." });
    }

    // Check if the user has already applied for this job with the same phone
    const { data: existingPhoneApp } = await supabase
      .from("applications")
      .select("application_id")
      .eq("job_id", parseInt(job_id))
      .eq("phone", phone)
      .limit(1);

    if (existingPhoneApp && existingPhoneApp.length > 0) {
      return res.status(400).json({ error: "An application with this phone number already exists for this position." });
    }

    const { url: resume_url } = await uploadToSupabase({
      file,
      category: "pdf",
      dir: "resumes",
      upsert: true,
    });

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
