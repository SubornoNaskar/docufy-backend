import React, { useState } from 'react';
import {
  Database,
  UploadCloud,
  Files,
  FileText,
  Search,
  Layers,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export default function Sidebar({
  documents = [],
  loading = false,
  selectedDocument = null,
  onSelectDocument,
  onSelectAllDocuments,
  onOpenUpload,
  onOpenDocumentInfo,
  onDeleteDocument,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const [filterText, setFilterText] = useState('');

  const filteredDocs = documents.filter((doc) =>
    (doc.filename || '').toLowerCase().includes(filterText.toLowerCase())
  );

  const sidebarContent = (
    <div className="flex flex-col h-full w-full">
      {/* Knowledge Base Header */}
      <div className="p-4 border-b border-[#17223b]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">Knowledge Base</h2>
            <p className="text-[11px] text-slate-400">Indexed vector documents</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#17223b]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Upload Drop Zone Card */}
      <div className="p-3">
        <div
          onClick={onOpenUpload}
          className="group relative border border-dashed border-blue-500/30 hover:border-blue-500/70 bg-[#0a1120] hover:bg-[#0e172e] rounded-xl p-4 transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center gap-2 shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600/20 group-hover:bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
            <UploadCloud className="w-5 h-5 group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
              Upload document or drag here
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              PDF, Word, Markdown, TXT, CSV (max 25MB)
            </p>
          </div>
        </div>
      </div>

      {/* All Documents Scope Selector */}
      <div className="px-3 pb-2">
        <button
          onClick={() => {
            onSelectAllDocuments();
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
            selectedDocument === null
              ? 'bg-blue-950/40 border-blue-500/40 text-white shadow-sm'
              : 'bg-[#0a1120]/60 border-[#17223b] text-slate-300 hover:bg-[#0e172c] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                selectedDocument === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#17223b] text-slate-400 group-hover:text-slate-200'
              }`}
            >
              <Files className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold">All Documents</p>
              <p className="text-[10px] text-slate-400">Search across complete corpus</p>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-md font-mono font-medium ${
              selectedDocument === null
                ? 'bg-blue-600/40 text-blue-200 border border-blue-500/30'
                : 'bg-[#17223b] text-slate-400'
            }`}
          >
            {documents.length}
          </span>
        </button>
      </div>

      {/* Filter Files Input */}
      <div className="px-3 py-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-[#0a1120] border border-[#17223b] focus:border-blue-500/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Section Header */}
      <div className="px-4 py-2 flex items-center justify-between text-[10px] font-semibold tracking-wider text-slate-500 uppercase border-b border-[#17223b]/40 mt-1">
        <span>DOCUMENTS ({filteredDocs.length})</span>
        <span>STATUS</span>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {loading && (
          <div className="flex items-center justify-center py-8 text-slate-500 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>Loading documents...</span>
          </div>
        )}

        {!loading && filteredDocs.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-xs text-slate-500 font-medium">No documents found</p>
            <p className="text-[11px] text-slate-600 mt-1">
              {filterText ? 'Try a different filter term' : 'Upload your first document above'}
            </p>
          </div>
        )}

        {!loading &&
          filteredDocs.map((doc) => {
            const isSelected = selectedDocument?.id === doc.id;
            const isIndexed = doc.status === 'INDEXED';
            const isFailed = doc.status === 'FAILED';
            const isProcessing = doc.status === 'PROCESSING' || doc.status === 'UPLOADING';

            return (
              <div
                key={doc.id}
                onClick={() => {
                  onSelectDocument(doc);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`group rounded-xl p-2.5 border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-sm ring-1 ring-blue-500/20'
                    : 'bg-[#0a1120]/70 border-[#17223b] text-slate-300 hover:bg-[#0e172e] hover:border-slate-700'
                }`}
              >
                {/* File Info Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <FileText
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <p
                        className="text-xs font-medium text-slate-200 group-hover:text-white truncate"
                        title={doc.filename}
                      >
                        {doc.filename}
                      </p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {formatBytes(doc.fileSize)} • {doc.totalPages || 1}p
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Icons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDocumentInfo(doc);
                      }}
                      className="p-1 rounded hover:bg-blue-900/40 text-slate-400 hover:text-blue-300"
                      title="Inspect vector chunks"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc);
                      }}
                      className="p-1 rounded hover:bg-red-900/40 text-slate-400 hover:text-red-400"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Chunks count and Status badge */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#17223b]/50 text-[10px]">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDocumentInfo(doc);
                    }}
                    className="flex items-center gap-1 text-slate-400 hover:text-blue-300 transition-colors"
                  >
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span>{doc.totalChunks || 0} chunks</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isIndexed && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Indexed
                      </span>
                    )}
                    {isProcessing && (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-400" />
                        Processing
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                        <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-72 lg:w-80 border-r border-[#17223b] bg-[#060a12] flex-col h-[calc(100vh-4rem)] flex-shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative z-50 w-72 sm:w-80 bg-[#060a12] border-r border-[#17223b] flex flex-col h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
