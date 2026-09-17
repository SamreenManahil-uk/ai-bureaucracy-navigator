import mongoose from "mongoose";
import { DocumentChunkModel } from "../models/DocumentChunk";
import { DocumentModel } from "../models/Document";
import { WorkflowModel } from "../models/Workflow";

type GeneratedWorkflow = {
  title: string;
  summary: string;
  steps: {
    order: number;
    title: string;
    description: string;
    sourceChunkIndexes: number[];
  }[];
};

const generateWorkflowWithOllama = async (
  documentName: string,
  context: string
): Promise<GeneratedWorkflow> => {
  const prompt = `
You are an AI workflow extraction assistant.

Convert the supplied document context into a practical structured workflow.

Rules:
- Use ONLY the supplied document context.
- Do not invent steps, deadlines, fees, requirements, or policies.
- Preserve the correct order of actions from the source.
- Return valid JSON only.
- No markdown.
- No explanation outside JSON.

Required JSON structure:

{
  "title": "string",
  "summary": "string",
  "steps": [
    {
      "order": 1,
      "title": "string",
      "description": "string",
      "sourceChunkIndexes": [0]
    }
  ]
}

Document:
${documentName}

Context:
${context}
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
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama workflow generation failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    response?: string;
  };

  if (!data.response) {
    throw new Error("Ollama returned an empty workflow response");
  }

  const parsed = JSON.parse(data.response) as GeneratedWorkflow;

  if (
    !parsed.title ||
    !parsed.summary ||
    !Array.isArray(parsed.steps) ||
    parsed.steps.length === 0
  ) {
    throw new Error("Generated workflow JSON is invalid");
  }

  return parsed;
};

export const createWorkflowFromDocument = async (
  documentId: string,
  ownerId: string
) => {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new Error("Invalid document id");
  }

  if (!mongoose.isValidObjectId(ownerId)) {
    throw new Error("Invalid owner id");
  }

  const ownedDocument = await DocumentModel.findOne({
    _id: documentId,
    ownerId,
  });

  if (!ownedDocument) {
    throw new Error("Document not found or access denied");
  }

  const chunks = await DocumentChunkModel.find({
    documentId,
  }).sort({ chunkIndex: 1 });

  if (chunks.length === 0) {
    throw new Error("No processed document chunks found");
  }

  const context = chunks
    .map(
      (chunk) =>
        `[Chunk ${chunk.chunkIndex}]\n${chunk.text}`
    )
    .join("\n\n");

  const generated = await generateWorkflowWithOllama(
    "Uploaded Process Document",
    context
  );

  const availableChunkIndexes = new Set(
    chunks.map((chunk) => chunk.chunkIndex)
  );

  const safeSteps = generated.steps.map((step, index) => ({
    order: index + 1,
    title: step.title,
    description: step.description,
    status: "pending" as const,
    sourceChunkIndexes: Array.isArray(step.sourceChunkIndexes)
      ? step.sourceChunkIndexes.filter((chunkIndex) =>
          availableChunkIndexes.has(chunkIndex)
        )
      : [],
  }));

  return WorkflowModel.create({
    ownerId,
    documentId,
    title: generated.title,
    summary: generated.summary,
    status: "draft",
    steps: safeSteps,
  });
};
