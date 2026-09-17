import {
  Router,
} from "express";

import {
  deleteDocument,
} from "../controllers/documentDeleteController";

import {
  requireAuth,
} from "../middleware/authMiddleware";

const router = Router();

router.delete(
  "/:id",
  requireAuth,
  deleteDocument
);

export default router;
