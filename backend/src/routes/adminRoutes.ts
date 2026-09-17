import { Router } from "express";
import { getAdminStats } from "../controllers/adminController";
import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/roleMiddleware";

const router = Router();

router.get(
  "/stats",
  requireAuth,
  requireAdmin,
  getAdminStats
);

export default router;
