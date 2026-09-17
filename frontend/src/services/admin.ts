const API_BASE_URL = "http://localhost:5000/api";

export type AdminStats = {
  users: number;
  documents: number;
  workflows: number;
};

const getToken = () => {
  const token =
    localStorage.getItem("authToken");

  if (!token) {
    throw new Error(
      "Authentication required"
    );
  }

  return token;
};

export const getAdminStats =
  async (): Promise<AdminStats> => {
    const response = await fetch(
      `${API_BASE_URL}/admin/stats`,
      {
        headers: {
          Authorization:
            `Bearer ${getToken()}`,
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Admin access unavailable"
      );
    }

    return data;
  };
