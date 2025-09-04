import { Request, Response } from "express";
import { supabase } from "../config/supabase";

// POST /api/onboarding/session
// Creates a new onboarding session
export const createOnboardingSession = async (req: Request, res: Response) => {
  try {
    const { data: newSession, error } = await supabase
      .from("onboarding_sessions")
      .insert({ session_data: {} })
      .select("id")
      .single();

    if (error) throw error;
    if (!newSession) throw new Error("Failed to create onboarding session.");

    res.status(201).json({ sessionId: newSession.id });
  } catch (error: any) {
    console.error("Error creating onboarding session:", error);
    res
      .status(500)
      .json({
        message: "Failed to create onboarding session.",
        error: error.message,
      });
  }
};

// GET /api/onboarding/session/:sessionId
// Retrieves an onboarding session
export const getOnboardingSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const { data: session, error } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) throw error;
    if (!session)
      return res.status(404).json({ message: "Session not found." });

    res.status(200).json(session);
  } catch (error: any) {
    console.error(`Error fetching session ${sessionId}:`, error);
    res
      .status(500)
      .json({ message: "Failed to fetch session data.", error: error.message });
  }
};

// PUT /api/onboarding/session/:sessionId
// Updates an onboarding session
export const updateOnboardingSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { session_data } = req.body;

  if (!session_data) {
    return res
      .status(400)
      .json({ message: "session_data is required in the request body." });
  }

  try {
    const { data: updatedSession, error } = await supabase
      .from("onboarding_sessions")
      .update({ session_data, updated_at: new Date() })
      .eq("id", sessionId)
      .select("id, updated_at")
      .single();

    if (error) throw error;
    if (!updatedSession)
      return res.status(404).json({ message: "Session not found to update." });

    res
      .status(200)
      .json({
        message: "Session updated successfully.",
        session: updatedSession,
      });
  } catch (error: any) {
    console.error(`Error updating session ${sessionId}:`, error);
    res
      .status(500)
      .json({ message: "Failed to update session.", error: error.message });
  }
};
