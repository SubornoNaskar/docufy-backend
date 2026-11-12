# Docufy Frontend Application

A modern, responsive, end-to-end React & Tailwind CSS web application built for the **Docufy** Spring AI backend.

---

## 📸 Overview & Features

This application closely replicates the dark aesthetic and workflow shown in the design screenshots (`@frontend/screenshots/`):

1. **Document Upload Dialog with Progress Bar**
   - Single and multiple document uploads (`.pdf`, `.docx`, `.md`, `.txt`, `.csv` up to 25MB).
   - Real-time progress bar tracking upload % and status (uploading, chunking, pgvector embedding, indexing).
   - Connected directly to backend endpoints:
     - `POST /api/v1/documents/upload`
     - `POST /api/v1/documents/upload-multiple`

2. **User Chat & RAG Intelligence**
   - Interactive Q&A against the whole knowledge base or scoped to an individual document.
   - Grounded citations display with file name, chunk index, page number, similarity score, and excerpt viewer.
   - Real-time token streaming toggle (`Stream Tokens`) powered by Server-Sent Events (`POST /api/v1/chat/stream`).
   - Standard query support (`POST /api/v1/chat/query`) with response time in ms.
   - Conversation memory via persistent `conversationId`.
   - Export chat history as Markdown and clear chat options.

3. **Feature Templates (Screenshot 1)**
   - Pre-configured prompt cards on the empty dashboard:
     - 📄 **Summarize Key Points**: Summarize the key points and executive highlights of this document.
     - ❓ **Interview / Q&A Insights**: What are the most critical questions and answers covered in this text?
     - 📝 **Action Items & Deadlines**: List all actionable takeaways, deadlines, and responsibilities mentioned.
     - 💡 **Technical Concepts**: Explain the main technical concepts and architecture described in this document.
   - One-click trigger to immediately execute or stage the prompt in chat.

4. **Semantic Vector Similarity Search Modal (Screenshot 3)**
   - Triggerable from top navigation or via global shortcut `⌘ K` / `Ctrl+K`.
   - Connected to `POST /api/v1/chat/search/similarity`.
   - Search across concepts, clauses, or facts with similarity match percentages and snippet previews.
   - Includes one-click "Ask in Chat" and copy snippet options.

5. **Document Chunks Information Modal (Screenshot 4)**
   - Click any document in the sidebar or "View Chunks" to open the inspector.
   - Displays 4 metadata stat cards:
     - **File Size**
     - **Vector Chunks**
     - **Total Pages**
     - **Uploaded Date**
   - Lists all indexed vector chunks (`Chunk #0`, `Chunk #1`, etc.) with monospace viewer.
   - Allows direct document deletion (`DELETE /api/v1/documents/{id}`) and scoping to chat ("Chat with Document").

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18 (Tested on Node v24)
- Docufy Spring Boot backend running on `http://localhost:8081`

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application runs on `http://localhost:5173`.
All `/api/*` requests are proxied automatically to `http://localhost:8081`.

### Production Build

```bash
cd frontend
npm run build
npm run preview
```
