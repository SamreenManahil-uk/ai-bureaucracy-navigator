import { retrieveRelevantChunks } from "./retrievalService";

type OllamaGenerateResponse = {
  response?: string;
};

export const generateGroundedAnswer = async (
  question: string
) => {
  const chunks = await retrieveRelevantChunks(question, 3);

  if (chunks.length === 0) {
    return {
      answer:
        "I could not find enough information in the uploaded documents to answer that reliably.",
      sources: [],
    };
  }

  const context = chunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1} | Chunk ${chunk.chunkIndex}]\n${chunk.text}`
    )
    .join("\n\n");

  const prompt = `
You are a grounded document assistant.

Answer ONLY using the supplied context.

If the answer is not supported by the context, say:
"I could not find enough information in the uploaded documents to answer that reliably."

Do not invent facts.
Do not use outside knowledge.

Question:
${question}

Context:
${context}

Give a concise answer.
`.trim();

  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generation failed: ${response.status}`);
  }

  const data = (await response.json()) as OllamaGenerateResponse;

  const answer =
    data.response?.trim() ||
    "I could not find enough information in the uploaded documents to answer that reliably.";

  return {
    answer,
    sources: chunks.map((chunk) => ({
      documentId: chunk.documentId,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
    })),
  };
};
