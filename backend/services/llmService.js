/**
 * DocuMind RAG LLM service
 *
 * Uses OpenRouter FREE Models Router.
 * No Gemini API is used.
 */

const OPENROUTER_LLM_MODEL = 'openrouter/free';

/**
 * Generates grounded RAG response.
 *
 * @param {string} question
 * @param {Array<{chunk: Object, score: number}>} searchResults
 * @param {Array<{role: string, content: string}>} history
 */
export const generateRAGResponse = async (
  question,
  searchResults,
  history = []
) => {
  if (!searchResults || searchResults.length === 0) {
    return {
      answer:
        "I couldn't find any relevant uploaded document content to answer your question. Please upload a PDF document first.",
      sources: [],
    };
  }

  const sources = searchResults.map(({ chunk, score }) => ({
    pageNumber: chunk.pageNumber || 1,
    chunkText: chunk.text,
    filename: chunk.filename || 'Document.pdf',
    score: Number(score.toFixed(4)),
  }));

  const contextBlock = searchResults
    .map(
      ({ chunk }, idx) =>
        `[Source ${idx + 1}: ${chunk.filename}, Page ${chunk.pageNumber}]\n${chunk.text}`
    )
    .join('\n\n---\n\n');

  let historyBlock = '';

  if (history && history.length > 0) {
    const recentHistory = history.slice(-6);

    historyBlock =
      `RECENT CONVERSATION HISTORY:\n` +
      recentHistory
        .map(
          (h) =>
            `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`
        )
        .join('\n') +
      '\n\n---\n\n';
  }

  const systemInstruction = `
You are an expert AI Document Assistant called DocuMind.

Answer the user's question strictly using the provided document context.

Rules:

1. Use the provided document context as the primary source of truth.
2. Do not invent facts that are not present in the context.
3. Include page citations such as [Page 3] whenever referring to information from a document.
4. If multiple files are involved, use [Page X, File Y].
5. If the context does not contain enough information, clearly say so.
6. Do not pretend to know information that is missing from the documents.
7. Give a clear, professional answer.
8. Use Markdown when useful.
9. Answer the user's actual question directly.
`;

  const prompt = `
${systemInstruction}

${historyBlock}

DOCUMENT CONTEXT:
${contextBlock}

USER QUESTION:
${question}

Provide a grounded answer with page citations.
`;

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error(
      'OPENROUTER_API_KEY is missing. Add your OpenRouter API key to backend/.env'
    );
  }

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',

          // Optional OpenRouter metadata
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'DocuMind PDF Chat',
        },
        body: JSON.stringify({
          model: OPENROUTER_LLM_MODEL,

          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],

          temperature: 0.2,
          max_tokens: 1200,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `OpenRouter LLM error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();

    const text =
      data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error(
        'OpenRouter returned an empty response.'
      );
    }

    return {
      answer: text,
      sources,
    };
  } catch (error) {
    console.error('OpenRouter API error:', error);

    throw new Error(
      `AI response generation failed: ${error.message}`
    );
  }
};