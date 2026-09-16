import { Router } from "express";
import {
  answerQuestion,
  searchKnowledge,
} from "../controllers/ragController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/search", requireAuth, searchKnowledge);
router.post("/answer", requireAuth, answerQuestion);

export default router;
