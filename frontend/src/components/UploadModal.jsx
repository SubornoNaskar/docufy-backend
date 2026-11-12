import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Files,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { uploadSingleDocument, uploadMultipleDocuments } from '../api/apiClient';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
      setError(null);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(5);
    setCurrentStatus('Uploading files to Docufy backend...');
    setError(null);

    try {
      if (files.length === 1) {
        // Single file upload
        await uploadSingleDocument(files[0], (pct) => {
          // Keep progress below 90% while server chunks & embeds vectors
          const normalized = Math.min(Math.round(pct * 0.85), 85);
          setProgress(normalized);
          if (normalized >= 80) {
            setCurrentStatus('Token chunking and generating PgVector embeddings...');
          }
        });
      } else {
        // Multiple files upload
        await uploadMultipleDocuments(files, (pct) => {
          const normalized = Math.min(Math.round(pct * 0.85), 85);
          setProgress(normalized);
          if (normalized >= 80) {
            setCurrentStatus('Ingesting documents & creating vector embeddings...');
          }
        });
      }

      setProgress(100);
      setCurrentStatus('Documents indexed and ready for Q&A!');
      setSuccessCount(files.length);

      setTimeout(() => {
        setFiles([]);
        setUploading(false);
        setProgress(0);
        setCurrentStatus('');
        onUploadSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to upload document');
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    setProgress(0);
    setError(null);
    setCurrentStatus('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b111e] border border-[#1e2a44] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#17223b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Upload & Index Documents</h3>
              <p className="text-[11px] text-slate-400">
                Supports single or multiple files (PDF, DOCX, MD, TXT, CSV)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#17223b] transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/20'
                : 'border-[#1e2a44] hover:border-blue-500/60 bg-[#070b14]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".pdf,.docx,.doc,.txt,.md,.csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Drag & drop documents here, or <span className="text-blue-400 underline">browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Upload multiple files simultaneously (max 25MB each)
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Selected Files ({files.length})</span>
                {!uploading && (
                  <button
                    onClick={() => setFiles([])}
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#070b14] border border-[#17223b] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="text-slate-200 truncate font-medium">{file.name}</span>
                      <span className="text-slate-500 text-[10px] flex-shrink-0">
                        ({formatBytes(file.size)})
                      </span>
                    </div>
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar Section (Requirement 1) */}
          {uploading && (
            <div className="p-3.5 rounded-xl bg-[#070b14] border border-blue-900/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-300 font-medium flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  {currentStatus}
                </span>
                <span className="text-white font-mono font-semibold">{progress}%</span>
              </div>
              {/* Progress track */}
              <div className="w-full bg-[#17223b] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                Parsing document text and generating vector embeddings in Postgres pgvector...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Upload Error</p>
                <p className="text-[11px] text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#080d17] border-t border-[#17223b] flex items-center justify-end gap-2.5">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#17223b] transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/30 transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>
                  Upload {files.length > 0 ? `(${files.length} ${files.length === 1 ? 'file' : 'files'})` : ''}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
