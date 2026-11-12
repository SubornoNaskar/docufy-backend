import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Copy,
  Check,
  Layers,
  File,
  Calendar,
  Trash2,
  MessageSquare,
  Loader2,
  HardDrive,
  Search,
} from 'lucide-react';
import { formatBytes, formatDate, truncateId } from '../utils/formatters';
import { searchSimilarity, deleteDocument } from '../api/apiClient';

export default function DocumentChunksModal({
  isOpen,
  document: doc,
  onClose,
  onChatWithDocument,
  onDocumentDeleted,
}) {
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedChunkIdx, setCopiedChunkIdx] = useState(null);
  const [chunkFilter, setChunkFilter] = useState('');

  useEffect(() => {
    if (isOpen && doc?.id) {
      fetchChunksForDocument(doc);
    } else {
      setChunks([]);
      setConfirmDelete(false);
      setChunkFilter('');
    }
  }, [isOpen, doc]);

  if (!isOpen || !doc) return null;

  const fetchChunksForDocument = async (currentDoc) => {
    setLoadingChunks(true);
    try {
      // Use similarity search scoped to this document to fetch chunks
      // We pass doc filename or a common wildcard to pull matching chunks
      const searchTerms = [
        currentDoc.filename?.replace(/\.[^/.]+$/, ''),
        'the',
        'a',
        'document',
      ];
      const queryTerm = searchTerms[0] || 'document';

      const data = await searchSimilarity({
        query: queryTerm,
        documentId: currentDoc.id,
        topK: 25,
        similaritySearch: 0.0,
      });

      if (data?.matches && data.matches.length > 0) {
        // Sort chunks by chunkIndex
        const sorted = [...data.matches].sort((a, b) => (a.chunkIndex ?? 0) - (b.chunkIndex ?? 0));
        setChunks(sorted);
      } else {
        setChunks([]);
      }
    } catch (err) {
      console.warn('Could not fetch chunks via similarity:', err);
      setChunks([]);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleCopyId = () => {
    if (!doc?.id) return;
    navigator.clipboard.writeText(doc.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyChunk = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkIdx(idx);
    setTimeout(() => setCopiedChunkIdx(null), 2000);
  };

  const handleDelete = async () => {
    if (!doc?.id) return;
    setDeleting(true);
    try {
      await deleteDocument(doc.id);
      if (onDocumentDeleted) {
        onDocumentDeleted(doc.id);
      }
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const filteredChunks = chunkFilter
    ? chunks.filter((c) =>
        (c.snippet || '').toLowerCase().includes(chunkFilter.toLowerCase())
      )
    : chunks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Modal Dialog (Matches Screenshot 4) */}
      <div className="bg-[#0b1222] border border-[#1e2a44] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#17223b] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-md">
                {doc.filename}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="font-mono text-[11px] text-slate-400">
                  {truncateId(doc.id, 10, 4)}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-0.5 rounded hover:bg-[#17223b] text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy full document UUID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <span>•</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  INDEXED
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#17223b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Metadata Cards Grid (Matches Screenshot 4) */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080d19] border-b border-[#17223b]/60">
          {/* Card 1: File Size */}
          <div className="p-3.5 rounded-xl bg-[#0d1527] border border-[#1a2947] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <HardDrive className="w-4 h-4 text-slate-500" />
              <span>File Size</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white mt-1.5 font-mono">
              {formatBytes(doc.fileSize)}
            </p>
          </div>

          {/* Card 2: Vector Chunks */}
          <div className="p-3.5 rounded-xl bg-[#0d1527] border border-[#1a2947] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Vector Chunks</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white mt-1.5 font-mono">
              {doc.totalChunks || chunks.length || 0} Chunks
            </p>
          </div>

          {/* Card 3: Total Pages */}
          <div className="p-3.5 rounded-xl bg-[#0d1527] border border-[#1a2947] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <File className="w-4 h-4 text-indigo-400" />
              <span>Total Pages</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white mt-1.5 font-mono">
              {doc.totalPages || 1} Pages
            </p>
          </div>

          {/* Card 4: Uploaded */}
          <div className="p-3.5 rounded-xl bg-[#0d1527] border border-[#1a2947] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Uploaded</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white mt-1.5 font-mono">
              {formatDate(doc.createdAt)}
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div className="px-5 py-3 flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-[#17223b]/50">
          <div className="flex items-center gap-2 tracking-wider uppercase text-[11px]">
            <span>INDEXED VECTOR CHUNKS</span>
            {chunks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-[#17223b] text-slate-300 font-mono text-[10px]">
                {chunks.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {chunks.length > 2 && (
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter chunks..."
                  value={chunkFilter}
                  onChange={(e) => setChunkFilter(e.target.value)}
                  className="bg-[#070b14] border border-[#17223b] rounded-md pl-6 pr-2 py-0.5 text-[11px] text-slate-200 placeholder-slate-500 outline-none w-32 focus:w-44 transition-all"
                />
              </div>
            )}
            <span className="tracking-wider uppercase text-[11px] text-slate-500">
              SAMPLE CHUNKS
            </span>
          </div>
        </div>

        {/* Chunks List Body (Matches Screenshot 4) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {loadingChunks && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <p className="text-xs">Loading document vector chunks...</p>
            </div>
          )}

          {!loadingChunks && filteredChunks.length === 0 && (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs text-slate-400">
                {chunks.length === 0
                  ? 'No vector chunks returned yet. Vector store indexed successfully.'
                  : 'No chunks matching your filter.'}
              </p>
              {chunks.length === 0 && (
                <button
                  onClick={() => fetchChunksForDocument(doc)}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Reload chunks
                </button>
              )}
            </div>
          )}

          {!loadingChunks &&
            filteredChunks.map((chunk, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#070b14] border border-[#1a2947] overflow-hidden group shadow-sm hover:border-blue-500/40 transition-colors"
              >
                {/* Chunk Header */}
                <div className="px-3.5 py-2 bg-[#0a1120] border-b border-[#17223b] flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 font-mono">
                    Chunk #{chunk.chunkIndex !== null && chunk.chunkIndex !== undefined ? chunk.chunkIndex : idx}
                  </span>
                  <div className="flex items-center gap-2">
                    {chunk.pageNumber && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Page {chunk.pageNumber}
                      </span>
                    )}
                    <button
                      onClick={() => handleCopyChunk(chunk.snippet, idx)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-[#17223b] hover:bg-[#1e2a44] transition-colors"
                      title="Copy chunk text"
                    >
                      {copiedChunkIdx === idx ? (
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

                {/* Chunk Content */}
                <div className="p-3.5 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {chunk.snippet}
                </div>
              </div>
            ))}
        </div>

        {/* Footer Actions (Matches Screenshot 4) */}
        <div className="p-4 bg-[#080d19] border-t border-[#17223b] flex items-center justify-between">
          {/* Delete Action (Left) */}
          <div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Document</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300 font-medium">Are you sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Close & Chat with Document (Right) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#0d1527] hover:bg-[#172544] border border-[#1a2947] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onChatWithDocument(doc);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat with Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
