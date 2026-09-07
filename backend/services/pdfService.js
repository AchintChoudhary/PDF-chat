import { PDFParse } from 'pdf-parse';

export const extractPdfTextPages = async (pdfBuffer) => {
  if (!pdfBuffer) {
    throw new Error('PDF buffer is required');
  }

  const parser = new PDFParse({
    data: pdfBuffer,
  });

  try {
    const result = await parser.getText();

    const text = result.text || '';

    const pageTexts = text.split('\f');

    const pages = pageTexts.map(
      (pageText, index) => ({
        pageNumber: index + 1,
        text: pageText.trim(),
      })
    );

    const nonEmptyPages = pages.filter(
      (page) => page.text.length > 0
    );

    return {
      pageCount:
        result.total ||
        nonEmptyPages.length,

      pages: nonEmptyPages,
    };
  } finally {
    await parser.destroy();
  }
};