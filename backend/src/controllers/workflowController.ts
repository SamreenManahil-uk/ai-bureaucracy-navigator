import type { Request, Response } from "express";
import { createWorkflowFromDocument } from "../services/workflowGenerationService";
import { WorkflowModel } from "../models/Workflow";

export const generateWorkflow = async (
  req: Request,
  res: Response
) => {
  try {
    const { documentId } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!documentId || typeof documentId !== "string") {
      return res.status(400).json({
        message: "documentId is required",
      });
    }

    const workflow = await createWorkflowFromDocument(
      documentId,
      userId
    );

    return res.status(201).json(workflow);
  } catch (error) {
    console.error("Workflow generation error:", error);

    return res.status(500).json({
      message: "Failed to generate workflow",
    });
  }
};

export const listWorkflows = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const workflows = await WorkflowModel.find({
      ownerId: userId,
    }).sort({ createdAt: -1 });

    return res.json(workflows);
  } catch (error) {
    console.error("List workflows error:", error);

    return res.status(500).json({
      message: "Failed to load workflows",
    });
  }
};
