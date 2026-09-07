import asyncHandler from 'express-async-handler';
import ChatHistory from '../models/ChatHistory.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { searchSimilarChunks } from '../services/vectorStoreService.js';
import { generateRAGResponse } from '../services/llmService.js';

// @desc    Process RAG chat query over uploaded documents
// @route   POST /api/chat
// @access  Private
export const askQuestion = asyncHandler(async (req, res) => {
  const { question, documentId, history } = req.body;

  if (!question || question.trim().length === 0) {
    res.status(400);
    throw new Error('Question is required');
  }

  // 1. Generate query vector embedding
  const queryVector = await generateEmbedding(question);

  // 2. Perform Cosine Similarity vector search over user's MongoDB chunks (Top 5) with optional documentId filter
  const searchResults = await searchSimilarChunks(req.user._id, queryVector, 5, documentId);

  // 3. Generate Grounded LLM Response with Page Citations & Multi-Turn History
  const { answer, sources } = await generateRAGResponse(question, searchResults, history || []);

  // 4. Save interaction to ChatHistory DB
  const chatEntry = await ChatHistory.create({
    userId: req.user._id,
    question,
    answer,
    sources,
  });

  res.status(200).json({
    _id: chatEntry._id,
    question: chatEntry.question,
    answer: chatEntry.answer,
    sources: chatEntry.sources,
    createdAt: chatEntry.createdAt,
  });
});
