import type { Request, Response } from "express";
import { runAgent } from "../agent/agentService";

export const handleAgentMessage = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        message: "message is required",
      });
    }

    const result = await runAgent(
      userId,
      message
    );

    return res.json(result);
  } catch (error) {
    console.error("Agent error:", error);

    return res.status(500).json({
      message: "Agent request failed",
    });
  }
};
