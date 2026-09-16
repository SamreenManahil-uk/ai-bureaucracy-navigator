import type { DocumentItem, HealthResponse } from "../types/api";

const API_BASE_URL = "http://localhost:5000/api";

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Failed to connect to backend");
  }

  return response.json();
};

export const getDocuments = async (): Promise<DocumentItem[]> => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("AUTH_REQUIRED");
  }

  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }

  return response.json();
};
