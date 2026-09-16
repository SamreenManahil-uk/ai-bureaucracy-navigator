export type TextChunk = {
  index: number;
  text: string;
  startChar: number;
  endChar: number;
};

export const chunkText = (
  text: string,
  chunkSize = 800,
  overlap = 150
): TextChunk[] => {
  if (!text.trim()) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);

    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push({
        index,
        text: chunk,
        startChar: start,
        endChar: end,
      });

      index += 1;
    }

    if (end === text.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
};
