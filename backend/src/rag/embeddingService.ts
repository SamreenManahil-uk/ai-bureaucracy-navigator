export const createEmbedding = async (
  text: string
): Promise<number[]> => {
  const response = await fetch("http://127.0.0.1:11434/api/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nomic-embed-text",
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama embedding request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    embeddings?: number[][];
  };

  const embedding = data.embeddings?.[0];

  if (!embedding) {
    throw new Error("Ollama returned no embedding");
  }

  return embedding;
};
