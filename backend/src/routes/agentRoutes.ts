import { Router } from "express";
import { handleAgentMessage } from "../controllers/agentController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/message", requireAuth, handleAgentMessage);

export default router;
