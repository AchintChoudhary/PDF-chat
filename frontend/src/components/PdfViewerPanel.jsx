import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import api from '../services/api';

const PdfViewerPanel = ({
  document,
  initialPage = 1,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  useEffect(() => {
    const loadPdfUrl = async () => {
      if (!document?._id) return;

      setLoading(true);
      setError('');
      setPdfUrl('');

      try {
        const response = await api.get(
          `/documents/${document._id}/file`
        );

        const data = response?.data;

        if (!data?.url) {
          throw new Error(
            'PDF URL was not returned by the server.'
          );
        }

        setPdfUrl(data.url);
      } catch (err) {
        console.error(
          'Failed to load PDF:',
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load PDF.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPdfUrl();
  }, [document?._id]);

  if (!document) return null;

  const pdfUrlWithPage = pdfUrl
    ? `${pdfUrl}#page=${currentPage}`
    : '';

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl overflow-hidden glass-panel shadow-2xl transition-all duration-300">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 bg-gray-900/90 px-3 py-3 sm:px-4">

        {/* Document information */}
        <div className="flex min-w-0 flex-1 items-center space-x-3 truncate">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileText className="h-4 w-4" />
          </div>

          <div className="truncate">
            <h3
              className="text-xs font-bold text-white truncate max-w-[200px]"
              title={document.originalName}
            >
              {document.originalName}
            </h3>

            <p className="text-[10px] text-gray-400">
              Page{' '}
              <span className="font-semibold text-purple-300">
                {currentPage}
              </span>{' '}
              of {document.pageCount || '?'}
            </p>
          </div>
        </div>

        {/* Page navigation */}
        <div className="order-3 flex items-center space-x-1.5 bg-gray-950/60 border border-gray-800 rounded-xl px-2 py-1 sm:order-none">

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.max(1, p - 1)
              )
            }
            disabled={currentPage <= 1}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-xs font-mono text-gray-300 px-1">
            {currentPage}
          </span>

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(
                  document.pageCount || 999,
                  p + 1
                )
              )
            }
            disabled={
              document.pageCount &&
              currentPage >= document.pageCount
            }
            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center space-x-1">

          {pdfUrl && (
            <a
              href={pdfUrlWithPage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 rounded-lg p-1.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-blue-400 transition"
              title="Open in new window"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-rose-400 transition"
            title="Close Preview"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-950/90 relative overflow-hidden">

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-purple-400" />

            <p className="text-sm">
              Loading PDF...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">

            <FileText className="h-10 w-10 text-red-400 mb-3" />

            <p className="text-sm text-red-300 font-semibold">
              Unable to load PDF
            </p>

            <p className="text-xs text-gray-500 mt-2 max-w-md">
              {error}
            </p>

          </div>
        )}

        {!loading && !error && pdfUrl && (
          <iframe
            key={`${document._id}-${currentPage}`}
            src={pdfUrlWithPage}
            className="w-full h-full border-0"
            title={`PDF Preview - ${document.originalName}`}
          />
        )}

      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 bg-gray-900/60 px-4 py-2 flex items-center justify-between text-[11px] text-gray-400">

        <span className="flex items-center space-x-1.5 text-purple-400">
          <Sparkles className="h-3.5 w-3.5" />

          <span>
            Citation Page Jumper Active
          </span>
        </span>

        <span className="text-gray-500 font-mono">
          {document.chunkCount || 0} Vector Chunks
        </span>

      </div>

    </div>
  );
};

export default PdfViewerPanel;