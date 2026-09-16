import { DocumentModel } from "../models/Document";
import { extractPdfText } from "./pdfService";
import { chunkText } from "../rag/chunkingService";
import { DocumentChunkModel } from "../models/DocumentChunk";
import { createEmbedding } from "../rag/embeddingService";

export const createUploadedDocument = async (file: Express.Multer.File) => {
  const document = await DocumentModel.create({
    filename: file.originalname,
    originalName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    status: "processing",
  });

  try {
    const { text, pageCount } = await extractPdfText(file.buffer);

    document.extractedText = text;
    document.pageCount = pageCount;

    const chunks = chunkText(text);

    await DocumentChunkModel.deleteMany({
      documentId: document._id,
    });

    if (chunks.length > 0) {
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

      await DocumentChunkModel.insertMany(chunkDocuments);
    }

    document.status = "processed";

    await document.save();

    return document;
  } catch (error) {
    document.status = "failed";
    await document.save();

    throw error;
  }
};

export const getAllDocuments = async () => {
  return DocumentModel.find()
    .select("-extractedText")
    .sort({
      createdAt: -1,
    });
};

export const getDocumentById = async (id: string) => {
  return DocumentModel.findById(id);
};
