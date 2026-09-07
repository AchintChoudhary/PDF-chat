import asyncHandler from 'express-async-handler';

import Document from '../models/Document.js';
import Chunk from '../models/Chunk.js';

import {
  extractPdfTextPages,
} from '../services/pdfService.js';

import {
  chunkDocumentPages,
} from '../services/chunkerService.js';

import {
  generateBatchEmbeddings,
} from '../services/embeddingService.js';

import {
  uploadPdf,
  deletePdf,
  downloadPdf,
  createSignedPdfUrl,
} from '../services/supabaseService.js';


// @desc Upload and process PDF
// @route POST /api/upload
// @access Private
export const uploadDocument = asyncHandler(
  async (req, res) => {

    if (!req.file) {
      res.status(400);
      throw new Error(
        'Please upload a PDF file'
      );
    }

    const {
      originalname,
      buffer,
      size,
    } = req.file;

    let storagePath = null;
    let document = null;

    try {

      // 1. Upload PDF to Supabase
      const storage = await uploadPdf({
        buffer,
        filename: originalname,
        userId: req.user._id.toString(),
      });

      storagePath = storage.path;


      // 2. Extract text directly from buffer
      const {
        pageCount,
        pages,
      } = await extractPdfTextPages(buffer);


      if (
        !pages ||
        pages.length === 0 ||
        pages.every(
          (p) =>
            !p.text ||
            p.text.trim().length === 0
        )
      ) {

        await deletePdf(storagePath);

        res.status(400);

        throw new Error(
          'Failed to extract text from PDF. It may be scanned or empty.'
        );
      }


      // 3. Chunk PDF
      const rawChunks =
        chunkDocumentPages(
          pages,
          800,
          150
        );


      if (rawChunks.length === 0) {

        await deletePdf(storagePath);

        res.status(400);

        throw new Error(
          'PDF contains no extractable text content.'
        );
      }


      // 4. Generate embeddings
      const embeddings =
        await generateBatchEmbeddings(
          rawChunks
        );


      // 5. Save document metadata
      document = await Document.create({
        userId: req.user._id,

        originalName: originalname,

        filename: originalname,

        filepath: storagePath,

        size,

        pageCount,

        chunkCount: rawChunks.length,
      });


      // 6. Save chunks
      const chunkDocs =
        rawChunks.map(
          (chunk, index) => ({
            documentId:
              document._id,

            userId:
              req.user._id,

            text: chunk.text,

            pageNumber:
              chunk.pageNumber,

            chunkIndex:
              chunk.chunkIndex,

            filename:
              originalname,

            embedding:
              embeddings[index],
          })
        );


      await Chunk.insertMany(
        chunkDocs
      );


      // 7. Response
      res.status(201).json({

        message:
          'Document uploaded, processed, and indexed successfully',

        document: {

          _id:
            document._id,

          originalName:
            document.originalName,

          size:
            document.size,

          pageCount:
            document.pageCount,

          chunkCount:
            document.chunkCount,

          createdAt:
            document.createdAt,
        },
      });

    } catch (error) {

      if (storagePath) {
        await deletePdf(
          storagePath
        );
      }

      if (document) {
        await Chunk.deleteMany({
          documentId:
            document._id,
        });

        await Document.deleteOne({
          _id:
            document._id,
        });
      }

      res.status(500);

      throw new Error(
        `PDF Processing Error: ${error.message}`
      );
    }
  }
);


// @desc Get user's documents
// @route GET /api/documents
// @access Private
export const getDocuments =
  asyncHandler(
    async (req, res) => {

      const documents =
        await Document
          .find({
            userId:
              req.user._id,
          })
          .sort({
            createdAt: -1,
          });

      res.json(documents);
    }
  );


// @desc Get PDF signed URL
// @route GET /api/documents/:id/file
// @access Private
export const getDocumentFile =
  asyncHandler(
    async (req, res) => {

      const document =
        await Document.findOne({
          _id: req.params.id,
          userId: req.user._id,
        });

      if (!document) {
        res.status(404);

        throw new Error(
          'Document not found'
        );
      }

      const signedUrl =
        await createSignedPdfUrl(
          document.filepath,
          3600
        );

      res.json({
        url: signedUrl,
      });
    }
  );


// @desc Delete document
// @route DELETE /api/documents/:id
// @access Private
export const deleteDocument =
  asyncHandler(
    async (req, res) => {

      const document =
        await Document.findOne({
          _id: req.params.id,
          userId: req.user._id,
        });

      if (!document) {
        res.status(404);

        throw new Error(
          'Document not found'
        );
      }


      // Delete PDF from Supabase
      await deletePdf(
        document.filepath
      );


      // Delete chunks
      await Chunk.deleteMany({
        documentId:
          document._id,
      });


      // Delete document metadata
      await Document.deleteOne({
        _id:
          document._id,
      });


      res.json({
        message:
          'Document deleted successfully',
      });
    }
  );