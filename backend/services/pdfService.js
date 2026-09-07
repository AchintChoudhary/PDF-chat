import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Parses PDF buffer/file into array of page contents with page numbers.
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<{pageCount: number, pages: Array<{pageNumber: number, text: string}>}>}
 */
export const extractPdfTextPages = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);

  const pages = [];
  
  // Custom pager render to track exact page numbers
  const options = {
    pagerender: (pageData) => {
      return pageData.getTextContent().then((textContent) => {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        pages.push({
          pageNumber: pages.length + 1,
          text: text.trim(),
        });
        return text;
      });
    },
  };

  const parsed = await pdfParse(dataBuffer, options);

  // Fallback if pages array is empty
  if (pages.length === 0 && parsed.text) {
    const rawPages = parsed.text.split(/\n\s*\n/);
    rawPages.forEach((text, idx) => {
      if (text.trim()) {
        pages.push({
          pageNumber: idx + 1,
          text: text.trim(),
        });
      }
    });
  }

  return {
    pageCount: parsed.numpages || pages.length || 1,
    pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: parsed.text }],
  };
};
