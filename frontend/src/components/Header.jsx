import React from 'react';
import { Search, ExternalLink, Sun, Sparkles, BookOpen, Menu } from 'lucide-react';

export default function Header({
  documentsCount = 0,
  selectedDocument = null,
  onResetScope,
  onOpenSearch,
  onToggleMobileSidebar,
}) {
  return (
    <header className="h-16 border-b border-[#17223b] bg-[#070b14] px-3 sm:px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Mobile Toggle & Branding */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          type="button"
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#17223b] transition-colors"
          title="Toggle documents drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30 flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg text-white tracking-tight">Docufy</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60 shadow-sm">
              <Sparkles className="w-3 h-3 text-blue-400" />
              AI RAG
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal -mt-0.5 tracking-wide hidden sm:block">
            Spring AI • PostgreSQL pgvector • OpenAI
          </p>
        </div>
      </div>

      {/* Center: Scope Pill */}
      <div className="hidden md:flex items-center">
        <div
          onClick={selectedDocument ? onResetScope : undefined}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selectedDocument
              ? 'bg-blue-950/70 border-blue-500/50 text-blue-300 hover:bg-blue-900/60 cursor-pointer shadow-sm'
              : 'bg-[#0f172a] border-[#1e293b] text-slate-300'
          }`}
          title={selectedDocument ? 'Click to reset scope to all documents' : 'Currently querying all documents'}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>
            Scope:{' '}
            <strong className="text-white font-semibold">
              {selectedDocument ? selectedDocument.filename : `All Documents (${documentsCount})`}
            </strong>
          </span>
          {selectedDocument && (
            <span className="ml-1 text-[10px] bg-blue-800/80 hover:bg-blue-700 text-blue-200 px-1.5 py-0.5 rounded-md font-mono">
              ✕ Reset
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#17223b] border border-[#1e293b] hover:border-slate-600 text-slate-300 hover:text-white text-xs transition-all duration-150 shadow-sm group"
          title="Search vector chunks (Cmd+K / Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
          <span className="font-medium hidden sm:inline">Search Chunks</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-[#1e293b] text-slate-400 rounded border border-slate-700 font-mono">
            ⌘ K
          </kbd>
        </button>

        <a
          href="http://localhost:8081/swagger-ui/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium px-2 py-1.5 rounded-lg hover:bg-[#0f172a]"
        >
          <span>Swagger API</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0f172a] transition-colors cursor-pointer border border-transparent hover:border-[#1e293b]">
          <Sun className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
