import React, { useState, useEffect } from 'react';
import { FileText, X, ExternalLink, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const PdfViewerPanel = ({ document, initialPage = 1, onClose }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    if (initialPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  if (!document) return null;

  // Construct PDF URL with page anchor
  const backendBaseUrl = 'http://localhost:5000';
  const pdfUrl = document.filename
    ? `${backendBaseUrl}/uploads/${document.filename}#page=${currentPage}`
    : `${backendBaseUrl}/api/documents/${document._id}/file#page=${currentPage}`;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-800 bg-[#0f172a]/80 backdrop-blur-xl overflow-hidden glass-panel shadow-2xl transition-all duration-300">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/90 px-4 py-3">
        <div className="flex items-center space-x-3 truncate">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileText className="h-4 w-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-white truncate max-w-[200px]" title={document.originalName}>
              {document.originalName}
            </h3>
            <p className="text-[10px] text-gray-400">
              Page <span className="font-semibold text-purple-300">{currentPage}</span> of {document.pageCount || '?'}
            </p>
          </div>
        </div>

        {/* Page Jump & Navigation Controls */}
        <div className="flex items-center space-x-1.5 bg-gray-950/60 border border-gray-800 rounded-xl px-2 py-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setCurrentPage((p) => Math.min(document.pageCount || 999, p + 1))}
            disabled={document.pageCount && currentPage >= document.pageCount}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 rounded-lg p-1.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-blue-400 transition"
            title="Open in new window"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-rose-400 transition"
            title="Close Preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Embedded PDF Viewer Iframe */}
      <div className="flex-1 bg-gray-950/90 relative overflow-hidden">
        <iframe
          key={`${document._id}-${currentPage}`}
          src={pdfUrl}
          className="w-full h-full border-0"
          title={`PDF Preview - ${document.originalName}`}
        />
      </div>

      {/* Footer Info Badge */}
      <div className="border-t border-gray-800 bg-gray-900/60 px-4 py-2 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center space-x-1.5 text-purple-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Citation Page Jumper Active</span>
        </span>
        <span className="text-gray-500 font-mono">
          {document.chunkCount || 0} Vector Chunks
        </span>
      </div>
    </div>
  );
};

export default PdfViewerPanel;
