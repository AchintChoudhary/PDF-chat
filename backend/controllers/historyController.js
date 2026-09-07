import asyncHandler from 'express-async-handler';
import ChatHistory from '../models/ChatHistory.js';

// @desc    Get user chat history
// @route   GET /api/history
// @access  Private
export const getChatHistory = asyncHandler(async (req, res) => {
  const history = await ChatHistory.find({ userId: req.user._id }).sort({ createdAt: 1 });
  res.json(history);
});

// @desc    Clear user chat history
// @route   DELETE /api/history
// @access  Private
export const clearChatHistory = asyncHandler(async (req, res) => {
  await ChatHistory.deleteMany({ userId: req.user._id });
  res.json({ message: 'Chat history cleared successfully' });
});
