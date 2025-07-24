import { Request, Response } from "express";
import { handleOrganizeThoughts } from "../thought-organizer-clean";

/**
 * Handle continuing an "Organize Thoughts" conversation
 */
export async function continueOrganizeThoughts(req: Request, res: Response) {
  try {
    const { userInput, sessionId, conversationStep } = req.body;
    const userId = (req.session as any)?.userId || null;

    if (!userInput) {
      return res.status(400).json({ error: "User input is required" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const result = await handleOrganizeThoughts(
      userInput,
      [], // previousMessages - empty for this route
      userId,
      sessionId,
      'gpt-4o'
    );

    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error in continueOrganizeThoughts:', error);
    return res.status(500).json({ 
      error: "I encountered an error while organizing your thoughts. Please try again." 
    });
  }
}