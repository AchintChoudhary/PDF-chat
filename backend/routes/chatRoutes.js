import express from 'express';
import { askQuestion } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, askQuestion);

export default router;
