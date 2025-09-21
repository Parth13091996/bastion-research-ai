import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getApplications = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("applications").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    {
      application_id: 1,
      job_id: 1,
      applicant_name: "John Doe",
      date_applied: "2024-07-20",
      status: "Pending",
    },
    {
      application_id: 2,
      job_id: 1,
      applicant_name: "Jane Smith",
      date_applied: "2024-07-21",
      status: "Reviewed",
    },
  ];
  res.status(200).json(dummyData);
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
          status 
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
  const { job_id, applicant_name, status } = req.body;
  const { data, error } = await supabase
    .from("applications")
    .update({ job_id, applicant_name, status })
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
