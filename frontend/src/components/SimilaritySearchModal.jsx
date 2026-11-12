import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Sparkles,
  FileText,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { searchSimilarity } from '../api/apiClient';

export default function SimilaritySearchModal({
  isOpen,
  onClose,
  onSelectChunkForChat,
  selectedDocument = null,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await searchSimilarity({
        query: query.trim(),
        documentId: selectedDocument?.id,
        topK: 10,
        similaritySearch: 0.0,
      });
      setResults(data);
    } catch (err) {
      console.error('Similarity search error:', err);
      setError(err?.response?.data?.message || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySnippet = (snippet, index) => {
    navigator.clipboard.writeText(snippet);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Modal Dialog (Matches Screenshot 3) */}
      <div className="bg-[#0b1222] border border-[#1e2a44] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#17223b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                Semantic Vector Similarity Search
              </h3>
              {selectedDocument && (
                <p className="text-[11px] text-blue-400">
                  Filtering across "{selectedDocument.filename}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#17223b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar (Matches Screenshot 3) */}
        <div className="p-4 sm:p-5 border-b border-[#17223b]/60 bg-[#080d19]">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search concepts, clauses, or facts across vector chunks..."
                className="w-full bg-[#0d1527] border border-[#1a2947] focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </button>
          </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Empty State (Matches Screenshot 3) */}
          {!results && !loading && (
            <div className="py-14 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
                Type a search term above to inspect matching vector chunks.
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <p className="text-xs">Computing cosine similarity across vector store...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Results List */}
          {results && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-2 border-b border-[#17223b]/40 mb-3">
                <span>
                  Found <strong className="text-white">{results.totalMatches || 0}</strong> matching chunks
                </span>
                <span className="text-[11px] text-slate-500">Sorted by vector relevance</span>
              </div>

              {results.matches && results.matches.length > 0 ? (
                <div className="space-y-3">
                  {results.matches.map((item, index) => {
                    const similarityPct = item.similarityScore
                      ? Math.round(item.similarityScore * 100)
                      : null;

                    return (
                      <div
                        key={index}
                        className="p-3.5 rounded-xl bg-[#070b14] border border-[#172544] hover:border-blue-500/40 transition-all text-xs space-y-2 group"
                      >
                        {/* Header: File info and Match badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-300 font-medium">
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            <span className="truncate max-w-[280px]">{item.fileName}</span>
                            {item.pageNumber && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                p. {item.pageNumber}
                              </span>
                            )}
                            {item.chunkIndex !== null && item.chunkIndex !== undefined && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                #chunk-{item.chunkIndex}
                              </span>
                            )}
                          </div>
                          {similarityPct !== null && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              {similarityPct}% match
                            </span>
                          )}
                        </div>

                        {/* Chunk Text */}
                        <div className="p-2.5 rounded-lg bg-[#04070e] border border-[#141d30] font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {item.snippet}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopySnippet(item.snippet, index)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-[#0d1527] hover:bg-[#172544] border border-[#1a2947] transition-colors"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                          {onSelectChunkForChat && (
                            <button
                              onClick={() => {
                                onSelectChunkForChat(item.snippet);
                                onClose();
                              }}
                              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/40 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Ask in Chat</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No matching vector chunks found for "{results.query}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
