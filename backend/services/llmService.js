import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates grounded RAG response using Google Gemini API or intelligent context synthesis fallback.
 * @param {string} question - User question
 * @param {Array<{chunk: Object, score: number}>} searchResults - Top matching retrieved chunks
 * @param {Array<{role: string, content: string}>} [history] - Previous chat turns
 * @returns {Promise<{answer: string, sources: Array<{pageNumber: number, chunkText: string, filename: string, score: number}>}>}
 */
export const generateRAGResponse = async (question, searchResults, history = []) => {
  if (!searchResults || searchResults.length === 0) {
    return {
      answer: "I couldn't find any relevant uploaded document content to answer your question. Please upload a PDF document first.",
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
    .map(({ chunk }, idx) => `[Source ${idx + 1}: ${chunk.filename}, Page ${chunk.pageNumber}]\n${chunk.text}`)
    .join('\n\n---\n\n');

  let historyBlock = '';
  if (history && history.length > 0) {
    const recentHistory = history.slice(-6); // Take up to last 6 turns
    historyBlock = `RECENT CONVERSATION HISTORY:\n` + recentHistory.map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n') + '\n\n---\n\n';
  }

  const systemInstruction = `You are an expert AI Document Assistant (DocuMind RAG). 
Answer the user's question accurately based strictly on the provided Context excerpts below.
Follow these rules:
1. Ground your answer in the provided Context excerpts.
2. Include exact page citations like [Page X] or [Page X, File Y] when referencing specific information.
3. If the context does not contain enough information to answer the question completely, clearly state what information is available and what is missing.
4. Keep your answer clear, well-structured, professional, and easy to read using markdown formatting.`;

  const prompt = `${systemInstruction}\n\n${historyBlock}CONTEXT EXCERPTS:\n${contextBlock}\n\nUSER QUESTION:\n${question}\n\nPROVIDE GROUNDED ANSWER WITH [Page X] CITATIONS:`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (text) {
        return {
          answer: text,
          sources,
        };
      }
    } catch (err) {
      console.warn('Gemini API call error, using context extraction response generator:', err.message);
    }
  }

  const topPassages = searchResults.slice(0, 3);
  const synthesizedLines = topPassages.map(
    ({ chunk }) => `• According to **${chunk.filename}** ([Page ${chunk.pageNumber}]):\n> "${chunk.text.substring(0, 300)}..."`
  );

  const fallbackAnswer = `Here is the relevant information found in your document regarding **"${question}"**:\n\n${synthesizedLines.join('\n\n')}\n\n*(Note: Provide a valid \`GEMINI_API_KEY\` in backend \`.env\` for dynamic LLM response generation).*`;

  return {
    answer: fallbackAnswer,
    sources,
  };
};
