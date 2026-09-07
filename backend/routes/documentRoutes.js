import express from 'express';
import { uploadDocument, getDocuments, deleteDocument, getDocumentFile } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/documents', protect, getDocuments);
router.get('/documents/:id/file', protect, getDocumentFile);
router.delete('/documents/:id', protect, deleteDocument);

export default router;
