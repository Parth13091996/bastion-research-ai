import { Request, Response } from "express";
import { supabase } from "../supabase";
import type { AuthRequest } from "../middleware/auth.middleware";

const QNA_TABLE = "qna_questions";

type QnaStatus = "pending" | "answered";

function getAuthorName(user: any) {
  const name = [user?.first_name, user?.last_name]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");

  return name || user?.username || user?.email || "User";
}

function mapQuestion(row: any) {
  const status: QnaStatus = row.answer ? "answered" : "pending";

  return {
    id: row.id,
    question: row.question,
    category: row.category ?? null,
    status,
    answer: row.answer ?? "",
    author: row.author_name ?? "User",
    user_id: row.user_id ?? null,
    answered_by: row.answered_by ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    answered_at: row.answered_at ?? null,
  };
}

function validateQuestion(question: unknown) {
  if (typeof question !== "string" || !question.trim()) {
    return "question is required";
  }

  if (question.trim().length > 1000) {
    return "question must be 1000 characters or less";
  }

  return null;
}

function validateAnswer(answer: unknown) {
  if (typeof answer !== "string" || !answer.trim()) {
    return "answer is required";
  }

  if (answer.trim().length > 5000) {
    return "answer must be 5000 characters or less";
  }

  return null;
}

export async function listQnaQuestions(req: Request, res: Response) {
  try {
    const status = String(req.query.status || "").toLowerCase();
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();

    let query = supabase
      .from(QNA_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (status === "pending") {
      query = query.is("answer", null);
    } else if (status === "answered") {
      query = query.not("answer", "is", null);
    } else if (status && status !== "all") {
      return res.status(400).json({ error: "Invalid status filter" });
    }

    if (search) {
      query = query.ilike("question", `%${search}%`);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json((data || []).map(mapQuestion));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function createQnaQuestion(req: AuthRequest, res: Response) {
  try {
    const { question, category } = req.body as { question?: string; category?: string };
    const validationError = validateQuestion(question);

    if (validationError) return res.status(400).json({ error: validationError });

    const { data, error } = await supabase
      .from(QNA_TABLE)
      .insert({
        question: question!.trim(),
        category: category || null,
        author_name: getAuthorName(req.user),
        user_id: req.user?.id ?? null,
      })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json(mapQuestion(data));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function answerQnaQuestion(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { answer } = req.body as { answer?: string };
    const validationError = validateAnswer(answer);

    if (!id) return res.status(400).json({ error: "ID is required" });
    if (validationError) return res.status(400).json({ error: validationError });

    const { data, error } = await supabase
      .from(QNA_TABLE)
      .update({
        answer: answer!.trim(),
        answered_at: new Date().toISOString(),
        answered_by: req.user?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Question not found" });

    return res.status(200).json(mapQuestion(data));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function clearQnaAnswer(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID is required" });

    const { data, error } = await supabase
      .from(QNA_TABLE)
      .update({
        answer: null,
        answered_at: null,
        answered_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Question not found" });

    return res.status(200).json(mapQuestion(data));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function deleteQnaQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID is required" });

    const { error } = await supabase.from(QNA_TABLE).delete().eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
