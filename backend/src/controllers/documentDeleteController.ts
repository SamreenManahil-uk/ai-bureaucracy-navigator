import type {
  Request,
  Response,
} from "express";

import {
  Types,
} from "mongoose";

import {
  DocumentModel,
} from "../models/Document";

import {
  DocumentChunkModel,
} from "../models/DocumentChunk";

import {
  WorkflowModel,
} from "../models/Workflow";

export const deleteDocument = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const rawDocumentId = req.params.id;

    const documentId =
      Array.isArray(rawDocumentId)
        ? rawDocumentId[0]
        : rawDocumentId;

    const userId =
      req.auth.userId;

    if (
      !documentId ||
      !Types.ObjectId.isValid(documentId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        message:
          "Invalid document identifier",
      });
    }

    const documentObjectId =
      new Types.ObjectId(
        documentId
      );

    const userObjectId =
      new Types.ObjectId(
        userId
      );

    const document =
      await DocumentModel.collection.findOne({
        _id: documentObjectId,
        ownerId: userObjectId,
      });

    if (!document) {
      return res.status(404).json({
        message:
          "Document not found",
      });
    }

    await Promise.all([
      DocumentChunkModel.collection.deleteMany({
        documentId:
          documentObjectId,
      }),

      WorkflowModel.collection.deleteMany({
        documentId:
          documentObjectId,
        ownerId:
          userObjectId,
      }),

      DocumentModel.collection.deleteOne({
        _id:
          documentObjectId,
        ownerId:
          userObjectId,
      }),
    ]);

    return res.json({
      message:
        "Document deleted successfully",
      documentId,
    });
  } catch (error) {
    console.error(
      "Delete document error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete document",
    });
  }
};
