import React, { useState, useEffect } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import ChatWindow from '../components/ChatWindow';
import SourceModal from '../components/SourceModal';
import PdfViewerPanel from '../components/PdfViewerPanel';
import api from '../services/api';
import { Layers, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const DashboardPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [activeSource, setActiveSource] = useState(null);
  
  // PDF Viewer State
  const [activePdfDoc, setActivePdfDoc] = useState(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [showPdfPanel, setShowPdfPanel] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const { data } = await api.get('/documents');
      setDocuments(data || []);
      
      // Auto select first document if viewer panel is closed
      if (data && data.length > 0 && !activePdfDoc) {
        setActivePdfDoc(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch user documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleJumpToPage = (pageNumber, filename) => {
    let targetDoc = activePdfDoc;
    
    if (filename && documents.length > 0) {
      const found = documents.find((d) => d.originalName.toLowerCase().includes(filename.toLowerCase()) || d.filename.toLowerCase().includes(filename.toLowerCase()));
      if (found) targetDoc = found;
    }

    if (!targetDoc && documents.length > 0) {
      targetDoc = documents[0];
    }

    if (targetDoc) {
      setActivePdfDoc(targetDoc);
      setPdfPage(pageNumber || 1);
      setShowPdfPanel(true);
    }
  };

  const handlePreviewDoc = (doc) => {
    setActivePdfDoc(doc);
    setPdfPage(1);
    setShowPdfPanel(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      
      {/* Top Knowledge Overview Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-4 backdrop-blur-md glass-panel">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Document Knowledge Base</h2>
            <p className="text-xs text-gray-400">
              {documents.length} PDF Document{documents.length === 1 ? '' : 's'} Indexed •{' '}
              {documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0)} Vector Chunks Active
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {documents.length > 0 && (
            <button
              onClick={() => setShowPdfPanel(!showPdfPanel)}
              className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                showPdfPanel
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                  : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {showPdfPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showPdfPanel ? 'Hide PDF Viewer' : 'Show PDF Viewer'}</span>
            </button>
          )}

          <div className="flex items-center space-x-2 rounded-xl bg-gray-800/60 border border-gray-700/50 px-3 py-1.5 text-xs text-gray-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Grounded RAG Mode</span>
          </div>
        </div>
      </div>

      {/* Grid Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
        
        {/* Left Column: PDF Upload & Document Library (3 cols when PDF viewer is open, 4 cols when closed) */}
        <div className={`${showPdfPanel ? 'lg:col-span-3' : 'lg:col-span-4'} flex flex-col space-y-6 overflow-y-auto pr-1 transition-all duration-300`}>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 glass-panel">
            <DocumentUpload onUploadSuccess={fetchDocuments} />
          </div>

          <div className="flex-1 rounded-2xl border border-gray-800 bg-gray-900/60 p-4 glass-panel">
            <DocumentList
              documents={documents}
              loading={loadingDocs}
              onDeleteSuccess={fetchDocuments}
              onPreviewDoc={handlePreviewDoc}
            />
          </div>
        </div>

        {/* Middle Column: RAG Vector Chat Thread (5 cols when PDF viewer open, 8 cols when closed) */}
        <div className={`${showPdfPanel ? 'lg:col-span-5' : 'lg:col-span-8'} h-full transition-all duration-300`}>
          <ChatWindow
            onSelectSource={(src) => setActiveSource(src)}
            documents={documents}
            onJumpToPage={handleJumpToPage}
          />
        </div>

        {/* Right Column: Interactive Side-by-Side PDF Viewer (4 cols) */}
        {showPdfPanel && (
          <div className="lg:col-span-4 h-full animate-fadeIn transition-all duration-300">
            <PdfViewerPanel
              document={activePdfDoc}
              initialPage={pdfPage}
              onClose={() => setShowPdfPanel(false)}
            />
          </div>
        )}
      </div>

      {/* Source Citation Text Inspector Modal */}
      <SourceModal
        source={activeSource}
        onClose={() => setActiveSource(null)}
      />
    </div>
  );
};

export default DashboardPage;
