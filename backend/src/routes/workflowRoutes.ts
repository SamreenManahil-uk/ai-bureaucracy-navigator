import { Router } from "express";
import {
  generateWorkflow,
  listWorkflows,
} from "../controllers/workflowController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, listWorkflows);
router.post("/generate", requireAuth, generateWorkflow);

export default router;
