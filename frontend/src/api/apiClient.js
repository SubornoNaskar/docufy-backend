import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getValidConversationId(cid) {
  if (cid) return cid;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'conv-' + Math.random().toString(36).substring(2, 15);
}

/**
 * Fetch all documents
 */
export async function getDocuments() {
  const response = await apiClient.get('/documents');
  return response.data?.data || [];
}

/**
 * Upload a single document with progress tracking
 */
export async function uploadSingleDocument(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
}

/**
 * Upload multiple documents with progress tracking
 */
export async function uploadMultipleDocuments(files, onProgress) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post('/documents/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
}

/**
 * Delete a document by UUID
 */
export async function deleteDocument(id) {
  const response = await apiClient.delete(`/documents/${id}`);
  return response.data;
}

/**
 * Send a non-streaming chat query
 */
export async function askQuestion({ question, documentId, topK = 5, minSimilarity = 0.0, conversationId }) {
  const payload = {
    question,
    topK,
    minSimilarity,
    conversationId: getValidConversationId(conversationId),
  };
  if (documentId) {
    payload.documentId = documentId;
  }

  const response = await apiClient.post('/chat/query', payload);
  return response.data?.data;
}

/**
 * Stream chat tokens via SSE (/api/v1/chat/stream)
 */
export async function streamQuestion(
  { question, documentId, topK = 5, minSimilarity = 0.0, conversationId },
  { onToken, onDone, onError }
) {
  const validConvId = getValidConversationId(conversationId);
  const payload = {
    question,
    topK,
    minSimilarity,
    conversationId: validConvId,
  };
  if (documentId) {
    payload.documentId = documentId;
  }

  try {
    const streamUrl = `${API_BASE}/chat/stream`;
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stream request failed (${response.status}): ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let accumulated = '';
    let buffer = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        buffer += decoder.decode(value, { stream: !done });
      }

      // Process complete SSE events separated by \n\n (or \r\n\r\n)
      let boundaryIndex;
      while ((boundaryIndex = buffer.indexOf('\n\n')) !== -1) {
        const eventText = buffer.slice(0, boundaryIndex);
        buffer = buffer.slice(boundaryIndex + 2);

        // Within an SSE event, collect all data lines and join with \n
        const lines = eventText.split(/\r?\n/);
        const dataLines = [];
        for (const line of lines) {
          if (line.startsWith('data:')) {
            dataLines.push(line.slice(5));
          }
        }

        if (dataLines.length > 0) {
          const eventData = dataLines.join('\n');
          if (eventData.trim() === '[DONE]') {
            done = true;
            break;
          }

          accumulated += eventData;
          if (onToken) {
            onToken(eventData, accumulated);
          }
        }
      }

      if (done) break;
    }

    // Flush any remaining data in buffer after stream closes
    if (buffer.trim()) {
      const lines = buffer.split(/\r?\n/);
      const dataLines = [];
      for (const line of lines) {
        if (line.startsWith('data:')) {
          dataLines.push(line.slice(5));
        }
      }
      if (dataLines.length > 0) {
        const eventData = dataLines.join('\n');
        if (eventData.trim() !== '[DONE]') {
          accumulated += eventData;
          if (onToken) {
            onToken(eventData, accumulated);
          }
        }
      }
    }

    if (onDone) {
      onDone(accumulated);
    }
    return accumulated;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
}

/**
 * Semantic vector similarity search
 */
export async function searchSimilarity({ query, documentId, topK = 10, similaritySearch = 0.0 }) {
  const payload = {
    query,
    topK,
    similaritySearch,
  };
  if (documentId) {
    payload.documentId = documentId;
  }

  const response = await apiClient.post('/chat/search/similarity', payload);
  return response.data?.data;
}
