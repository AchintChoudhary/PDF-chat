import fs from 'fs';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text from a PDF page by page.
 */
export const extractPdfTextPages = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found: ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    const text = result.text || '';

    // pdf-parse v2 does not expose page text in exactly
    // the same format as the old version, so split using
    // form-feed page separators when available.
    const pageTexts = text.split('\f');

    const pages = pageTexts.map((pageText, index) => ({
      pageNumber: index + 1,
      text: pageText.trim(),
    }));

    const nonEmptyPages = pages.filter(
      (page) => page.text.length > 0
    );

    return {
      pageCount: result.total || nonEmptyPages.length,
      pages: nonEmptyPages,
    };
  } finally {
    await parser.destroy();
  }
};