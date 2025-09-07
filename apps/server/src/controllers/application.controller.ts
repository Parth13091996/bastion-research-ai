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
  const { job_id, applicant_name, status } = req.body;
  const { data, error } = await supabase
    .from("applications")
    .insert([{ job_id, applicant_name, status }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
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
