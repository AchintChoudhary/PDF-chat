import asyncHandler from 'express-async-handler';
import fs from 'fs';
import Document from '../models/Document.js';
import Chunk from '../models/Chunk.js';
import { extractPdfTextPages } from '../services/pdfService.js';
import { chunkDocumentPages } from '../services/chunkerService.js';
import { generateBatchEmbeddings } from '../services/embeddingService.js';

// @desc    Upload PDF, process text extraction, chunking, embeddings, and vector storage
// @route   POST /api/upload
// @access  Private
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a PDF file');
  }

  const { originalname, filename, path: filepath, size } = req.file;

  try {
    // 1. Extract text and page numbers from PDF
    const { pageCount, pages } = await extractPdfTextPages(filepath);

    if (!pages || pages.length === 0 || pages.every((p) => !p.text || p.text.trim().length === 0)) {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      res.status(400);
      throw new Error('Failed to extract text from PDF. It may be scanned or empty.');
    }

    // 2. Chunk text pages into semantic segments (800 chars, 150 overlap)
    const rawChunks = chunkDocumentPages(pages, 800, 150);

    if (rawChunks.length === 0) {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      res.status(400);
      throw new Error('PDF contains no extractable text content.');
    }

    // 3. Create Document record in MongoDB
    const document = await Document.create({
      userId: req.user._id,
      originalName: originalname,
      filename,
      filepath,
      size,
      pageCount,
      chunkCount: rawChunks.length,
    });

    // 4. Batch generate vector embeddings for all chunks
    const embeddings = await generateBatchEmbeddings(rawChunks);

    // 5. Store chunk vectors in MongoDB Chunk collection
    const chunkDocs = rawChunks.map((chunk, idx) => ({
      documentId: document._id,
      userId: req.user._id,
      text: chunk.text,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      filename: originalname,
      embedding: embeddings[idx],
    }));

    await Chunk.insertMany(chunkDocs);

    res.status(201).json({
      message: 'Document uploaded, processed, and indexed successfully',
      document: {
        _id: document._id,
        originalName: document.originalName,
        size: document.size,
        pageCount: document.pageCount,
        chunkCount: document.chunkCount,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.status(500);
    throw new Error(`PDF Processing Error: ${error.message}`);
  }
});

// @desc    Get all documents uploaded by user
// @route   GET /api/documents
// @access  Private
export const getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(documents);
});

// @desc    Delete document and its associated vector chunks
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Delete physical file from disk
  if (fs.existsSync(document.filepath)) {
    try {
      fs.unlinkSync(document.filepath);
    } catch (err) {
      console.error('Failed to delete file from disk:', err.message);
    }
  }

  // Delete vector chunks from MongoDB
  await Chunk.deleteMany({ documentId: document._id });

  // Delete document record
  await document.deleteOne();

  res.json({ message: 'Document and vector embeddings deleted successfully' });
});

// @desc    Get PDF file stream for inline PDF viewer
// @route   GET /api/documents/:id/file
// @access  Private
export const getDocumentFile = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });

  if (!document || !fs.existsSync(document.filepath)) {
    res.status(404);
    throw new Error('Document file not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
  const fileStream = fs.createReadStream(document.filepath);
  fileStream.pipe(res);
});
