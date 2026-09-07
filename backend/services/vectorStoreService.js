import Chunk from '../models/Chunk.js';

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Cosine similarity score between -1 and 1
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Searches MongoDB for top K most relevant text chunks matching a query vector.
 * @param {string} userId - User ID to filter authorized chunks
 * @param {number[]} queryVector - Query embedding vector
 * @param {number} topK - Number of top chunks to retrieve (default 5)
 * @param {string} [documentId] - Optional document ID to scope search to a single document
 * @returns {Promise<Array<{chunk: Object, score: number}>>}
 */
export const searchSimilarChunks = async (userId, queryVector, topK = 5, documentId = null) => {
  // Query object for MongoDB
  const query = { userId };
  if (documentId && documentId !== 'all') {
    query.documentId = documentId;
  }

  // Retrieve user chunks from MongoDB
  const chunks = await Chunk.find(query).lean();

  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Calculate similarity score for each chunk
  const scoredChunks = chunks.map((chunk) => {
    const score = cosineSimilarity(queryVector, chunk.embedding);
    return { chunk, score };
  });

  // Sort descending by similarity score
  scoredChunks.sort((a, b) => b.score - a.score);

  // Return top K items
  return scoredChunks.slice(0, topK);
};
