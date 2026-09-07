import { GoogleGenerativeAI } from '@google/generative-ai';

const VECTOR_DIMENSION = 384;

/**
 * Deterministic semantic fallback vector generator for local testing when API key is missing.
 * @param {string} text 
 * @returns {number[]}
 */
const generateFallbackEmbedding = (text) => {
  const vector = new Array(VECTOR_DIMENSION).fill(0);
  const normalized = text.toLowerCase();
  
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (charCode * 31 + i) % VECTOR_DIMENSION;
    vector[index] += 1;
  }
  
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map(val => Number((val / magnitude).toFixed(6)));
};

/**
 * Generates vector embedding for input text.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export const generateEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);

      if (result?.embedding?.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn('Gemini embedding API call failed, falling back to local vector generator:', err.message);
    }
  }

  return generateFallbackEmbedding(text);
};

/**
 * Batch generate embeddings for array of chunks.
 * @param {Array<{text: string}>} chunks
 * @returns {Promise<Array<number[]>>}
 */
export const generateBatchEmbeddings = async (chunks) => {
  const embeddings = [];
  for (const chunk of chunks) {
    const vector = await generateEmbedding(chunk.text);
    embeddings.push(vector);
  }
  return embeddings;
};
