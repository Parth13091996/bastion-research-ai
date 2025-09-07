import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getJobs = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("job_openings").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    {
      job_id: 1,
      job_title: "Software Engineer",
      author: "Admin",
      applications: 0,
      expiry: "2024-12-31",
      views: 0,
      conversion: 0,
    },
    {
      job_id: 2,
      job_title: "Product Manager",
      author: "Admin",
      applications: 0,
      expiry: "2024-11-30",
      views: 0,
      conversion: 0,
    },
  ];
  res.status(200).json(dummyData);
};

export const getJobById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("job_openings")
    .select("*")
    .eq("job_id", id)
    .single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const createJob = async (req: Request, res: Response) => {
  const { job_title, author, expiry } = req.body;

  const { data, error } = await supabase
    .from("job_openings")
    .insert([{ job_title, author, expiry }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
};

export const updateJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { job_title, author, expiry } = req.body;
  const { data, error } = await supabase
    .from("job_openings")
    .update({ job_title, author, expiry })
    .eq("job_id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const deleteJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("job_openings")
    .delete()
    .eq("job_id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};
