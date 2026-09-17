import type { Request, Response } from "express";
import { UserModel } from "../models/User";
import { DocumentModel } from "../models/Document";
import { WorkflowModel } from "../models/Workflow";

export const getAdminStats = async (
  _req: Request,
  res: Response
) => {
  try {
    const [
      users,
      documents,
      workflows,
    ] = await Promise.all([
      UserModel.countDocuments(),
      DocumentModel.countDocuments(),
      WorkflowModel.countDocuments(),
    ]);

    return res.json({
      users,
      documents,
      workflows,
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    return res.status(500).json({
      message: "Failed to load admin stats",
    });
  }
};
