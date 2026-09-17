import mongoose from "mongoose";
import { DocumentModel } from "../models/Document";
import { DocumentChunkModel } from "../models/DocumentChunk";
import { extractPdfText } from "./pdfService";
import { chunkText } from "../rag/chunkingService";
import { createEmbedding } from "../rag/embeddingService";

export const createUploadedDocument = async (
  file: Express.Multer.File,
  ownerId: string
) => {
  const document = await DocumentModel.create({
    ownerId,
    filename: file.originalname,
    originalName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    status: "processing",
  });

  try {
    const { text, pageCount } = await extractPdfText(file.buffer);

    const chunks = chunkText(text);

    await DocumentChunkModel.deleteMany({
      documentId: document._id,
    });

    const chunkDocuments = [];

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk.text);

      chunkDocuments.push({
        documentId: document._id,
        chunkIndex: chunk.index,
        text: chunk.text,
        startChar: chunk.startChar,
        endChar: chunk.endChar,
        embedding,
      });
    }

    if (chunkDocuments.length > 0) {
      await DocumentChunkModel.insertMany(chunkDocuments);
    }

    document.extractedText = text;
    document.pageCount = pageCount;
    document.status = "processed";

    await document.save();

    return document;
  } catch (error) {
    document.status = "failed";
    await document.save();
    throw error;
  }
};

export const getDocumentsByOwner = async (
  ownerId: string
) => {
  return DocumentModel.find({
    ownerId,
  }).sort({ createdAt: -1 });
};

export const getDocumentByIdForOwner = async (
  documentId: string,
  ownerId: string
) => {
  if (!mongoose.isValidObjectId(documentId)) {
    return null;
  }

  return DocumentModel.findOne({
    _id: documentId,
    ownerId,
  });
};
