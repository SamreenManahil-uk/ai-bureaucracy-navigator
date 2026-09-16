import { Router } from "express";
import {
  getDocument,
  listDocuments,
  uploadDocument,
} from "../controllers/documentController";
import { uploadPdf } from "../middleware/uploadMiddleware";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, listDocuments);

router.get("/:id", requireAuth, getDocument);

router.post(
  "/upload",
  requireAuth,
  uploadPdf.single("file"),
  uploadDocument
);

export default router;
