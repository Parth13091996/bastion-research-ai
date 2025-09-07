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
  const {
    job_title,
    author,
    expiry,
    team,
    experience,
    commitment,
    job_type,
    location,
    description,
    responsibilities,
    requirements,
    good_to_have,
    benefits,
  } = req.body ?? {};

  const toList = (val: any) =>
    Array.isArray(val)
      ? val
      : typeof val === "string"
      ? val
          .split(/\r?\n/)
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

  const payload: any = {
    job_title,
    author,
    expiry,
    team,
    experience,
    commitment,
    job_type,
    location,
    description,
    responsibilities: toList(responsibilities),
    requirements: toList(requirements),
    good_to_have: toList(good_to_have),
    benefits: toList(benefits),
  };

  const { data, error } = await supabase
    .from("job_openings")
    .insert([payload])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
};

export const updateJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    job_title,
    author,
    expiry,
    team,
    experience,
    commitment,
    job_type,
    location,
    description,
    responsibilities,
    requirements,
    good_to_have,
    benefits,
  } = req.body ?? {};

  const toList = (val: any) =>
    Array.isArray(val)
      ? val
      : typeof val === "string"
      ? val
          .split(/\r?\n/)
          .map((s: string) => s.trim())
          .filter(Boolean)
      : undefined; // If not provided, don't send

  const updatePayload: any = {};
  if (job_title !== undefined) updatePayload.job_title = job_title;
  if (author !== undefined) updatePayload.author = author;
  if (expiry !== undefined) updatePayload.expiry = expiry;
  if (team !== undefined) updatePayload.team = team;
  if (experience !== undefined) updatePayload.experience = experience;
  if (commitment !== undefined) updatePayload.commitment = commitment;
  if (job_type !== undefined) updatePayload.job_type = job_type;
  if (location !== undefined) updatePayload.location = location;
  if (description !== undefined) updatePayload.description = description;
  const r1 = toList(responsibilities);
  if (r1 !== undefined) updatePayload.responsibilities = r1;
  const r2 = toList(requirements);
  if (r2 !== undefined) updatePayload.requirements = r2;
  const r3 = toList(good_to_have);
  if (r3 !== undefined) updatePayload.good_to_have = r3;
  const r4 = toList(benefits);
  if (r4 !== undefined) updatePayload.benefits = r4;

  const { data, error } = await supabase
    .from("job_openings")
    .update(updatePayload)
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
