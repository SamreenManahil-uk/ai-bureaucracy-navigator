import {
  Router,
} from "express";

import {
  listActivities,
  logActivity,
} from "../controllers/activityController";

import {
  requireAuth,
} from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  listActivities
);

router.post(
  "/",
  requireAuth,
  logActivity
);

export default router;
