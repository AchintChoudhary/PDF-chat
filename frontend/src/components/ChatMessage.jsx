import React, { useState } from 'react';
import { Bot, User, BookOpen, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message, onSelectSource, onJumpToPage }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full space-x-3 p-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md shadow-blue-500/10">
          <Bot className="h-5 w-5 text-white" />
        </div>
      )}

      {/* Message Content Box */}
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm relative group ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'border border-gray-800 bg-gray-900/80 text-gray-200 rounded-bl-none glass-panel'
      }`}>
        
        {/* User / Bot Tag */}
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold opacity-75">
          <span className="flex items-center space-x-1.5">
            <span>{isUser ? 'You' : 'DocuMind Assistant'}</span>
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-normal opacity-60">
              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
            {!isUser && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-white text-gray-400"
                title="Copy Answer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Text / Markdown output */}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-dark text-sm leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Source Citations Badges */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 border-t border-gray-800/80 pt-3">
            <div className="mb-2 flex items-center space-x-1.5 text-xs font-semibold text-gray-400">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Retrieved Grounded Sources (Click to Jump PDF):</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, idx) => (
                <div key={idx} className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      if (onJumpToPage) {
                        onJumpToPage(src.pageNumber, src.filename);
                      }
                      if (onSelectSource) {
                        onSelectSource(src);
                      }
                    }}
                    className="flex items-center space-x-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-300 transition hover:bg-purple-500/20 hover:border-purple-500/50"
                  >
                    <BookOpen className="h-3 w-3 text-purple-400" />
                    <span className="font-medium">
                      {src.filename ? src.filename.substring(0, 14) + '...' : 'Doc'} • Page {src.pageNumber}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-800 border border-gray-700 text-gray-300">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
