import type { Request, Response } from "express";
import {
  createUploadedDocument,
  getAllDocuments,
  getDocumentById,
} from "../services/documentService";

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    const document = await createUploadedDocument(req.file);

    return res.status(201).json({
      id: document._id,
      filename: document.filename,
      status: document.status,
      pageCount: document.pageCount,
      fileSize: document.fileSize,
      textPreview: document.extractedText?.slice(0, 500),
    });
  } catch (error) {
    console.error("PDF upload error:", error);

    return res.status(500).json({
      message: "Failed to process PDF",
    });
  }
};

export const listDocuments = async (_req: Request, res: Response) => {
  try {
    const documents = await getAllDocuments();

    return res.status(200).json(documents);
  } catch (error) {
    console.error("Fetch documents error:", error);

    return res.status(500).json({
      message: "Failed to fetch documents",
    });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    const document = await getDocumentById(id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    return res.json(document);
  } catch {
    return res.status(400).json({
      message: "Invalid document ID",
    });
  }
};
