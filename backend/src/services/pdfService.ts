import { extractText, getDocumentProxy } from "unpdf";

export const extractPdfText = async (
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> => {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  const result = await extractText(pdf, {
    mergePages: true,
  });

  return {
    text: result.text.trim(),
    pageCount: result.totalPages,
  };
};
