import React from 'react';
import { FileText, Trash2, Layers, BookOpen, Eye } from 'lucide-react';
import api from '../services/api';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const DocumentList = ({ documents, loading, onDeleteSuccess, onPreviewDoc }) => {
  const handleDelete = async (docId, docName) => {
    if (window.confirm(`Are you sure you want to delete "${docName}"? This will remove all associated vector embeddings from MongoDB.`)) {
      try {
        await api.delete(`/documents/${docId}`);
        if (onDeleteSuccess) onDeleteSuccess();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete document');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-xs">Loading indexed documents...</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/30 p-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-500">
          <FileText className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-gray-300">No documents uploaded yet</p>
        <p className="mt-1 text-xs text-gray-500">Upload a PDF above to build your document knowledge base.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Indexed Documents ({documents.length})
        </h4>
      </div>

      <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="group flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 p-3 transition hover:border-gray-700 hover:bg-gray-800/50"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileText className="h-4 w-4" />
              </div>
              <div className="truncate">
                <h5 className="truncate text-xs font-medium text-gray-200 group-hover:text-white">
                  {doc.originalName}
                </h5>
                <div className="mt-1 flex items-center space-x-3 text-[11px] text-gray-400">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="h-3 w-3 text-gray-500" />
                    <span>{doc.pageCount || 1} pgs</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Layers className="h-3 w-3 text-purple-400" />
                    <span>{doc.chunkCount || 0} vectors</span>
                  </span>
                  <span>{formatBytes(doc.size || 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {onPreviewDoc && (
                <button
                  onClick={() => onPreviewDoc(doc)}
                  title="Preview PDF Document"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 transition"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(doc._id, doc.originalName)}
                title="Delete Document & Vectors"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
