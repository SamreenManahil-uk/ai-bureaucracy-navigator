import type { Request, Response } from "express";
import { retrieveRelevantChunks } from "../rag/retrievalService";
import { generateGroundedAnswer } from "../rag/ragAnswerService";

export const searchKnowledge = async (
  req: Request,
  res: Response
) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        message: "question is required",
      });
    }

    const results = await retrieveRelevantChunks(question);

    return res.json({
      question,
      results,
    });
  } catch (error) {
    console.error("RAG retrieval error:", error);

    return res.status(500).json({
      message: "Failed to retrieve relevant chunks",
    });
  }
};


export const answerQuestion = async (
  req: Request,
  res: Response
) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        message: "question is required",
      });
    }

    const result = await generateGroundedAnswer(question);

    return res.json({
      question,
      ...result,
    });
  } catch (error) {
    console.error("RAG answer error:", error);

    return res.status(500).json({
      message: "Failed to generate grounded answer",
    });
  }
};
