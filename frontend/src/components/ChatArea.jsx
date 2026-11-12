import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Download,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import FeatureTemplates from './FeatureTemplates';
import MarkdownRenderer from './MarkdownRenderer';

export default function ChatArea({
  messages = [],
  loading = false,
  streamTokens = true,
  onToggleStream,
  onSendMessage,
  onClearChat,
  onExportChat,
  selectedDocument = null,
  onOpenDocumentInfo,
}) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCitations, setExpandedCitations] = useState({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCitation = (msgIndex) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex],
    }));
  };

  return (
    <main className="flex-1  min-w-0 flex flex-col h-[calc(100vh-4rem)] bg-[#070b14] overflow-hidden relative">
      {/* Top Context Subheader (Matches Screenshot 2) */}
      <div className="h-11 px-4 sm:px-6 border-b border-[#17223b]/60 bg-[#080d19]/80 backdrop-blur-sm flex items-center justify-between z-10 flex-shrink-0 select-none">
        {/* Left: Context Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 truncate max-w-[60%]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
          <span className="truncate">
            Context:{' '}
            <strong className="text-white font-semibold">
              {selectedDocument ? selectedDocument.filename : 'All Uploaded Documents'}
            </strong>
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Stream Tokens Toggle Switch */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">Stream Tokens</span>
            <button
              onClick={onToggleStream}
              type="button"
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                streamTokens ? 'bg-blue-600' : 'bg-slate-700'
              }`}
              title="Toggle token-by-token streaming response"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  streamTokens ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Export Button */}
          {messages.length > 0 && (
            <button
              onClick={onExportChat}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-[#17223b] px-2 py-1 rounded-md transition-colors"
              title="Export chat history"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Clear Button */}
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 px-2 py-1 rounded-md transition-colors"
              title="Clear conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread or Feature Templates Hero */}
      <div className="flex-1 min-w-0 overflow-y-auto px-3 sm:px-6 md:px-8 py-6">
        {messages.length === 0 ? (
          <FeatureTemplates
            onSelectTemplate={(prompt) => {
              onSendMessage(prompt);
            }}
          />
        ) : (
          <div className="max-w-5xl mx-auto w-full space-y-6">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id || idx}
                  className={`w-full flex gap-3 sm:gap-4 items-start ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-600/30 ring-1 ring-blue-400/20 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Body */}
                  <div
                    className={`group relative rounded-2xl transition-all ${
                      isUser
                        ? 'max-w-xl sm:max-w-2xl rounded-tr-none bg-blue-600 text-white px-4 py-3 text-xs sm:text-sm shadow-md shadow-blue-600/20'
                        : 'flex-1 min-w-0 rounded-tl-none bg-[#0d1527] border border-[#172544] text-slate-100 p-4 sm:p-5 text-xs sm:text-sm shadow-sm'
                    }`}
                  >
                    {/* Text Content */}
                    {isUser ? (
                      <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>
                    ) : (
                      <div className="w-full min-w-0 overflow-hidden">
                        <MarkdownRenderer content={msg.content} isStreaming={msg.isStreaming} />
                      </div>
                    )}

                    {/* Grounded Sources / Citations Drawer (for Assistant) */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-[#172544] space-y-2.5">
                        <button
                          onClick={() => toggleCitation(idx)}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>
                            {msg.citations.length} Grounded Source
                            {msg.citations.length > 1 ? 's' : ''}
                          </span>
                          {expandedCitations[idx] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {expandedCitations[idx] && (
                          <div className="space-y-2 pt-1">
                            {msg.citations.map((cite, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-3 rounded-xl bg-[#070b14] border border-[#1a2947] text-[11px] text-slate-300 space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-semibold text-blue-300 truncate max-w-[280px]">
                                    📄 {cite.fileName}
                                  </span>
                                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                                    {cite.pageNumber && <span>p. {cite.pageNumber}</span>}
                                    {cite.chunkIndex !== null && cite.chunkIndex !== undefined && (
                                      <span>chunk #{cite.chunkIndex}</span>
                                    )}
                                    {cite.similarityScore && (
                                      <span className="text-emerald-400 font-medium">
                                        {Math.round(cite.similarityScore * 100)}% match
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-400 font-mono text-[10px] bg-[#050810] p-2 rounded-lg border border-[#152038] max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                  {cite.snippet}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Footer: Actions & Metadata */}
                    {!isUser && (
                      <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-slate-400 border-t border-[#172544]/40">
                        <div className="flex items-center gap-2">
                          {msg.responseTimeMs && (
                            <span className="inline-flex items-center gap-1 text-slate-400 font-mono">
                              <Zap className="w-3 h-3 text-amber-400" />
                              {msg.responseTimeMs}ms
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id || idx)}
                            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#172544] text-slate-400 hover:text-slate-200 transition-colors"
                            title="Copy message to clipboard"
                          >
                            {copiedId === (msg.id || idx) ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Spinner / Generating Response */}
            {loading && (
              <div className="w-full flex gap-3 sm:gap-4 items-start justify-start">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-600/30 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 bg-[#0d1527] border border-[#172544] rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm text-slate-300 flex items-center gap-3 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400 flex-shrink-0" />
                  <span>Analyzing knowledge base and formulating grounded response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input Section (Matches Screenshot 1 & 2) */}
      <div className="p-4 sm:px-6 md:px-8 border-t border-[#17223b]/60 bg-[#070b14] flex-shrink-0 select-none">
        <div className="max-w-5xl mx-auto w-full">
          <form
            onSubmit={handleSubmit}
            className="relative bg-[#0d1527] border border-[#1a2947] focus-within:border-blue-500/70 rounded-2xl p-2 transition-all shadow-lg shadow-black/30"
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedDocument
                  ? `Ask a question regarding "${selectedDocument.filename}"...`
                  : 'Ask a question across all documents...'
              }
              className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none resize-none px-2 py-1.5 font-normal"
            />
            <div className="flex items-center justify-end pt-1 pr-1">
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-md shadow-blue-600/30"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Subtext Hints (Matches Screenshot 1 & 2) */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#17223b] text-slate-300 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-[#17223b] text-slate-300 font-mono text-[10px]">Shift+Enter</kbd> for newline
            </span>
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <Zap className="w-3 h-3 text-blue-400" />
              Grounded RAG
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
