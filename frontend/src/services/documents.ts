const API_BASE_URL = "http://localhost:5000/api";

const getToken = () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
};

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/documents/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "PDF upload failed"
    );
  }

  return data;
};

export const generateWorkflow = async (
  documentId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/workflows/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        documentId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Workflow generation failed"
    );
  }

  return data;
};

export const deleteDocument = async (
  documentId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}`,
    {
      method: "DELETE",
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
        "Unable to delete document"
    );
  }

  return data;
};
