import { DocumentChunkModel } from "../models/DocumentChunk";
import { createEmbedding } from "./embeddingService";

const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valueA = a[i] ?? 0;
    const valueB = b[i] ?? 0;

    dot += valueA * valueB;
    normA += valueA * valueA;
    normB += valueB * valueB;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const retrieveRelevantChunks = async (
  question: string,
  limit = 3
) => {
  const questionEmbedding = await createEmbedding(question);

  const chunks = await DocumentChunkModel.find({
    embedding: { $exists: true },
  });

  const ranked = chunks
    .map((chunk) => ({
      id: chunk._id,
      documentId: chunk.documentId,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      score: cosineSimilarity(
        questionEmbedding,
        chunk.embedding ?? []
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
};
