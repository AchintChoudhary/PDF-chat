import React from 'react';
import { X, FileText, BookOpen, Layers, CheckCircle } from 'lucide-react';

const SourceModal = ({ source, onClose }) => {
  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-gray-800 bg-[#111827] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{source.filename || 'Document'}</h3>
              <div className="mt-1 flex items-center space-x-3 text-xs text-gray-400">
                <span className="flex items-center space-x-1 text-blue-400 font-medium">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Page {source.pageNumber}</span>
                </span>
                {source.score && (
                  <span className="flex items-center space-x-1 text-purple-400">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Vector Sim: {(source.score * 100).toFixed(1)}%</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Retrieved Context Chunk Text
          </label>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-800 bg-gray-900/80 p-4 text-xs font-mono leading-relaxed text-gray-300">
            {source.chunkText}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-500/20"
          >
            Close Source
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceModal;
