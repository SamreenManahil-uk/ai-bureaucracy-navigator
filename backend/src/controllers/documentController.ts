import type { Request, Response } from "express";
import {
  createUploadedDocument,
  getDocumentByIdForOwner,
  getDocumentsByOwner,
} from "../services/documentService";

export const uploadDocument = async (
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

    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    const document = await createUploadedDocument(
      req.file,
      userId
    );

    return res.status(201).json({
      id: document._id,
      filename: document.filename,
      status: document.status,
      pageCount: document.pageCount,
      fileSize: document.fileSize,
      textPreview: document.extractedText?.slice(0, 500),
    });
  } catch (error) {
    console.error("Upload document error:", error);

    return res.status(500).json({
      message: "Failed to process PDF",
    });
  }
};

export const listDocuments = async (
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

    const documents = await getDocumentsByOwner(userId);

    return res.json(documents);
  } catch (error) {
    console.error("List documents error:", error);

    return res.status(500).json({
      message: "Failed to load documents",
    });
  }
};

export const getDocument = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid document id",
      });
    }

    const document = await getDocumentByIdForOwner(
      id,
      userId
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    return res.json(document);
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      message: "Failed to load document",
    });
  }
};
