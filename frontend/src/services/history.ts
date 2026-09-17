const API_BASE_URL =
  "http://localhost:5000/api";

export type ActivityType =
  | "document_upload"
  | "workflow_generated"
  | "workflow_step_updated"
  | "rag_question"
  | "agent_action";

export type ActivityItem = {
  _id: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

const getToken = () => {
  const token =
    localStorage.getItem(
      "authToken"
    );

  if (!token) {
    throw new Error(
      "Authentication required"
    );
  }

  return token;
};

export const getHistory =
  async (): Promise<
    ActivityItem[]
  > => {
    const response = await fetch(
      `${API_BASE_URL}/history`,
      {
        headers: {
          Authorization:
            `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load history"
      );
    }

    return response.json();
  };

export const logHistory =
  async (
    type: ActivityType,
    title: string,
    description: string,
    metadata: Record<
      string,
      unknown
    > = {}
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/history`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          type,
          title,
          description,
          metadata,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to record history"
      );
    }

    return response.json();
  };
