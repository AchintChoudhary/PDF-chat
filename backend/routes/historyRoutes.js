import express from 'express';
import { getChatHistory, clearChatHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);

export default router;
