import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import UploadModal from './components/UploadModal';
import SimilaritySearchModal from './components/SimilaritySearchModal';
import DocumentChunksModal from './components/DocumentChunksModal';
import { getDocuments, askQuestion, streamQuestion, deleteDocument, searchSimilarity } from './api/apiClient';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [streamTokens, setStreamTokens] = useState(true);
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID());

  // Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inspectingDoc, setInspectingDoc] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast / Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch documents from backend
  const loadDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true);
      const data = await getDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      showToast('Could not load documents from server', 'error');
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle sending a message in chat
  const handleSendMessage = async (text) => {
    if (!text.trim() || loadingChat) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoadingChat(true);

    const startTime = Date.now();

    if (streamTokens) {
      // Streaming mode
      const assistantId = crypto.randomUUID();
      let hasStarted = false;
      let streamCitations = [];

      // Fetch grounded citations in parallel for streaming responses
      searchSimilarity({
        query: text,
        documentId: selectedDocument?.id,
        topK: 5,
        similaritySearch: 0.0,
      })
        .then((res) => {
          if (res?.matches) {
            streamCitations = res.matches;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, citations: streamCitations } : m
              )
            );
          }
        })
        .catch(() => {});

      try {
        await streamQuestion(
          {
            question: text,
            documentId: selectedDocument?.id,
            topK: 5,
            conversationId,
          },
          {
            onToken: (token, accumulated) => {
              if (!hasStarted) {
                hasStarted = true;
                setLoadingChat(false);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: assistantId,
                    role: 'assistant',
                    content: accumulated,
                    citations: streamCitations,
                    responseTimeMs: Date.now() - startTime,
                    isStreaming: true,
                  },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: accumulated,
                          citations: m.citations?.length ? m.citations : streamCitations,
                          isStreaming: true,
                        }
                      : m
                  )
                );
              }
            },
            onDone: (finalText) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: finalText,
                        citations: m.citations?.length ? m.citations : streamCitations,
                        responseTimeMs: Date.now() - startTime,
                        isStreaming: false,
                      }
                    : m
                )
              );
              setLoadingChat(false);
            },
            onError: (err) => {
              console.error('Stream error:', err);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, isStreaming: false } : m
                )
              );
              setLoadingChat(false);
              showToast(err.message || 'Streaming failed', 'error');
            },
          }
        );
      } catch (err) {
        console.error('Stream failed, falling back to standard query:', err);
        // Fallback to standard query if SSE fails
        try {
          const res = await askQuestion({
            question: text,
            documentId: selectedDocument?.id,
            topK: 5,
            conversationId,
          });
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: res.answer,
              citations: res.citations || [],
              responseTimeMs: res.responseTimeMs || Date.now() - startTime,
            },
          ]);
        } catch (fallbackErr) {
          showToast('Failed to get answer from AI assistant', 'error');
        } finally {
          setLoadingChat(false);
        }
      }
    } else {
      // Standard non-streaming query
      try {
        const res = await askQuestion({
          question: text,
          documentId: selectedDocument?.id,
          topK: 5,
          conversationId,
        });

        const assistantMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: res.answer,
          citations: res.citations || [],
          responseTimeMs: res.responseTimeMs || Date.now() - startTime,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error('Query error:', err);
        showToast(err?.response?.data?.message || err.message || 'Failed to get answer', 'error');
      } finally {
        setLoadingChat(false);
      }
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    setConversationId(crypto.randomUUID());
    showToast('Conversation cleared', 'info');
  };

  // Export chat history as Markdown
  const handleExportChat = () => {
    if (messages.length === 0) return;
    let md = `# Docufy Chat Export\nDate: ${new Date().toLocaleString()}\nScope: ${
      selectedDocument ? selectedDocument.filename : 'All Documents'
    }\n\n---\n\n`;

    messages.forEach((m) => {
      md += `### ${m.role === 'user' ? 'User' : 'Docufy Assistant'}\n\n${m.content}\n\n`;
      if (m.citations && m.citations.length > 0) {
        md += `*Sources:*\n`;
        m.citations.forEach((c) => {
          md += `- ${c.fileName} (chunk ${c.chunkIndex}, page ${c.pageNumber || 1})\n`;
        });
        md += `\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docufy-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat exported to Markdown', 'success');
  };

  // Delete document
  const handleDeleteDocument = async (doc) => {
    if (window.confirm(`Are you sure you want to delete "${doc.filename}" and its vector embeddings?`)) {
      try {
        await deleteDocument(doc.id);
        if (selectedDocument?.id === doc.id) {
          setSelectedDocument(null);
        }
        showToast(`Document "${doc.filename}" deleted`, 'success');
        loadDocuments();
      } catch (err) {
        console.error('Delete error:', err);
        showToast('Failed to delete document', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        documentsCount={documents.length}
        selectedDocument={selectedDocument}
        onResetScope={() => setSelectedDocument(null)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Workspace: Sidebar + Chat Area */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative">
        <Sidebar
          documents={documents}
          loading={loadingDocs}
          selectedDocument={selectedDocument}
          onSelectDocument={(doc) => {
            // Toggle selection or select
            setSelectedDocument(doc);
          }}
          onSelectAllDocuments={() => setSelectedDocument(null)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenDocumentInfo={(doc) => setInspectingDoc(doc)}
          onDeleteDocument={handleDeleteDocument}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <ChatArea
          messages={messages}
          loading={loadingChat}
          streamTokens={streamTokens}
          onToggleStream={() => setStreamTokens((prev) => !prev)}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          onExportChat={handleExportChat}
          selectedDocument={selectedDocument}
          onOpenDocumentInfo={(doc) => setInspectingDoc(doc)}
        />
      </div>

      {/* Upload Dialog Modal (Requirement 1) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          showToast('Documents uploaded and indexed successfully!', 'success');
          loadDocuments();
        }}
      />

      {/* Semantic Vector Similarity Search Modal (Requirement 4) */}
      <SimilaritySearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        selectedDocument={selectedDocument}
        onSelectChunkForChat={(snippet) => {
          handleSendMessage(`Explain and analyze this excerpt:\n\n"${snippet}"`);
        }}
      />

      {/* Document Chunks Information Modal (Requirement 5) */}
      <DocumentChunksModal
        isOpen={Boolean(inspectingDoc)}
        document={inspectingDoc}
        onClose={() => setInspectingDoc(null)}
        onChatWithDocument={(doc) => {
          setSelectedDocument(doc);
          showToast(`Chat scope set to "${doc.filename}"`, 'info');
        }}
        onDocumentDeleted={(deletedId) => {
          if (selectedDocument?.id === deletedId) {
            setSelectedDocument(null);
          }
          showToast('Document removed successfully', 'success');
          loadDocuments();
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border flex items-center gap-2 animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950 border-rose-800 text-rose-200'
              : toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-800 text-emerald-200'
              : 'bg-blue-950 border-blue-800 text-blue-200'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
