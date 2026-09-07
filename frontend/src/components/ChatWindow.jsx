import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, Sparkles, Loader2, Filter, Layers } from 'lucide-react';
import ChatMessage from './ChatMessage';
import api from '../services/api';

const SAMPLE_PROMPTS = [
  "Summarize the key findings of the document.",
  "What are the main concepts and methodology explained?",
  "List the conclusions and recommendations.",
];

const ChatWindow = ({ onSelectSource, documents = [], onJumpToPage }) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState('all');
  const messagesEndRef = useRef(null);

  const hasDocuments = documents && documents.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const { data } = await api.get('/history');
      if (data && data.length > 0) {
        const formatted = data.flatMap((item) => [
          {
            id: `${item._id}-q`,
            role: 'user',
            content: item.question,
            createdAt: item.createdAt,
          },
          {
            id: `${item._id}-a`,
            role: 'assistant',
            content: item.answer,
            sources: item.sources,
            createdAt: item.createdAt,
          },
        ]);
        setMessages(formatted);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all conversation history?')) {
      try {
        await api.delete('/history');
        setMessages([]);
      } catch (err) {
        alert('Failed to clear chat history');
      }
    }
  };

  const handleSubmit = async (e, promptText = null) => {
    if (e) e.preventDefault();
    const query = promptText || question;
    if (!query || query.trim().length === 0 || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    if (!promptText) setQuestion('');
    setLoading(true);

    // Take recent history turns for context memory
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const { data } = await api.post('/chat', {
        question: query,
        documentId: selectedDocId,
        history: historyPayload,
      });

      const assistantMessage = {
        id: data._id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error processing query: ${err.response?.data?.message || 'Server connection error.'}`,
        sources: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-800 bg-[#0f172a]/60 backdrop-blur-lg overflow-hidden glass-panel">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-800 bg-gray-900/60 px-5 py-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">RAG Intelligence Chat</h3>
            <p className="text-[10px] text-gray-400">Vector Search • Multi-Turn Memory • Page Citations</p>
          </div>
        </div>

        {/* Document Scope Filter & Controls */}
        <div className="flex items-center space-x-3">
          {hasDocuments && (
            <div className="flex items-center space-x-1.5 rounded-xl border border-gray-800 bg-gray-950/70 px-2.5 py-1 text-xs text-gray-300">
              <Filter className="h-3.5 w-3.5 text-purple-400" />
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer font-medium max-w-[150px] truncate"
              >
                <option value="all" className="bg-gray-900 text-gray-200">🔍 Search All Documents</option>
                {documents.map((doc) => (
                  <option key={doc._id} value={doc._id} className="bg-gray-900 text-gray-200">
                    📄 {doc.originalName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs text-gray-400 hover:bg-gray-800 hover:text-rose-400 transition"
              title="Clear Chat History"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {fetchingHistory ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400 mb-2" />
            <span className="text-xs">Loading chat history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 shadow-xl">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">Ask Anything About Your Documents</h3>
            <p className="mt-1 max-w-md text-xs text-gray-400">
              Upload a PDF on the left panel, then ask questions. The system retrieves relevant vector chunks and generates grounded answers with clickable page citations.
            </p>

            {/* Quick Prompt Suggestions */}
            {hasDocuments && (
              <div className="mt-6 w-full max-w-md space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Suggested Questions</p>
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleSubmit(e, prompt)}
                    className="w-full rounded-xl border border-gray-800 bg-gray-900/60 p-3 text-left text-xs text-gray-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSelectSource={onSelectSource}
              onJumpToPage={onJumpToPage}
            />
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3 text-xs text-gray-400 glass-panel">
              Searching vector embeddings & generating grounded response...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="border-t border-gray-800 bg-gray-900/70 p-4">
        <form onSubmit={(e) => handleSubmit(e)} className="flex items-center space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={hasDocuments ? "Ask a question about your uploaded PDF..." : "Please upload a PDF first to begin chatting..."}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
