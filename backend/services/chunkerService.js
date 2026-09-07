/**
 * Splitting extracted page text into semantic chunks with overlap.
 * @param {Array<{pageNumber: number, text: string}>} pages
 * @param {number} chunkSize - Number of characters per chunk (default 800)
 * @param {number} overlap - Overlapping character count (default 150)
 * @returns {Array<{text: string, pageNumber: number, chunkIndex: number}>}
 */
export const chunkDocumentPages = (pages, chunkSize = 800, overlap = 150) => {
  const chunks = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const text = page.text;
    if (!text || text.trim().length === 0) continue;

    if (text.length <= chunkSize) {
      chunks.push({
        text: text.trim(),
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex++,
      });
      continue;
    }

    let start = 0;
    while (start < text.length) {
      let end = start + chunkSize;
      
      // Try to break at closest space or newline to avoid cutting words
      if (end < text.length) {
        const nextSpace = text.lastIndexOf(' ', end);
        if (nextSpace > start + chunkSize * 0.7) {
          end = nextSpace;
        }
      }

      const chunkText = text.substring(start, end).trim();
      if (chunkText.length > 20) {
        chunks.push({
          text: chunkText,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex++,
        });
      }

      start = end - overlap;
      if (start >= text.length - overlap) break;
    }
  }

  return chunks;
};
