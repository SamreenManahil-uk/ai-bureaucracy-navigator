const API_BASE_URL = "http://localhost:5000/api";
const GRAPHQL_URL = "http://localhost:5000/graphql";

export type DashboardDocument = {
  _id: string;
  filename: string;
  originalName?: string;
  status: string;
  fileSize?: number;
  pageCount?: number;
  createdAt?: string;
};

export type WorkflowStep = {
  order: number;
  title: string;
  status: string;
};

export type DashboardWorkflow = {
  id: string;
  title: string;
  status: string;
  summary: string;
  steps: WorkflowStep[];
};

const getToken = () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
};

export const fetchDocuments = async (): Promise<DashboardDocument[]> => {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load documents");
  }

  return response.json();
};

export const fetchWorkflows = async (): Promise<DashboardWorkflow[]> => {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      query: `
        query {
          myWorkflows {
            id
            title
            status
            summary
            steps {
              order
              title
              status
            }
          }
        }
      `,
    }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    throw new Error("Failed to load workflows");
  }

  return payload.data.myWorkflows;
};

export const fetchAdminStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Admin stats unavailable");
  }

  return response.json() as Promise<{
    users: number;
    documents: number;
    workflows: number;
  }>;
};
