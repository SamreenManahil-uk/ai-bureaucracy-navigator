const API_BASE_URL = "http://localhost:5000/api";

export type AssistantMode = "rag" | "agent";

export type SourceChunk = {
  chunkIndex?: number;
  score?: number;
  text?: string;
};

export type AssistantReply = {
  answer: string;
  sources?: SourceChunk[];
};

const getToken = () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
};

const safeJson = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
};

export const askRag = async (
  question: string,
  documentId?: string
): Promise<AssistantReply> => {
  const response = await fetch(
    `${API_BASE_URL}/rag/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        question,
        ...(documentId
          ? { documentId }
          : {}),
      }),
    }
  );

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Unable to generate grounded answer"
    );
  }

  return {
    answer:
      data.answer ||
      data.response ||
      data.message ||
      "No answer returned.",
    sources:
      data.sources ||
      data.retrievedChunks ||
      data.chunks ||
      [],
  };
};

export const askAgent = async (
  message: string
): Promise<AssistantReply> => {
  const response = await fetch(
    `${API_BASE_URL}/agent/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        message,
      }),
    }
  );

  const data = await safeJson(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "AI agent request failed"
    );
  }

  return {
    answer:
      data.answer ||
      data.response ||
      data.message ||
      data.finalAnswer ||
      "Agent completed the request.",
    sources: [],
  };
};

export type AgentActionPreview = {
  action: string;
  description: string;
  requiresConfirmation: boolean;
  payload?: Record<string, unknown>;
};

export type AgentActionResult = {
  success: boolean;
  message: string;
};
