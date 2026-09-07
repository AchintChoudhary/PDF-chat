# 🚀 DocuMind RAG — Full-Stack MERN PDF Document Intelligence & Vector Chat

A complete, production-grade **MERN Stack (MongoDB, Express.js, React, Node.js)** Retrieval-Augmented Generation (RAG) system that allows users to upload PDF documents, extract and chunk text with page-level metadata, generate vector embeddings using Google Gemini (`text-embedding-004`), run Cosine Similarity vector search over MongoDB, and chat with grounded AI answers containing interactive side-by-side PDF page citations (`[Page X]`).

---

## 🏗️ High-Level System Architecture

```
                  +-----------------------------------+
                  |      React + Vite (Frontend)      |
                  | Drag-and-Drop PDF | Vector Chat   |
                  |   Interactive Side-by-Side Viewer |
                  +-----------------+-----------------+
                                    |
                                REST API (JWT)
                                    |
                  +-----------------v-----------------+
                  |       Express.js (Node.js)        |
                  |  Auth | PDF Upload | Vector RAG   |
                  +-----------------+-----------------+
                                    |
           +------------------------+------------------------+
           |                                                 |
  +--------v---------+                             +---------v--------+
  | Ingestion Engine |                             | RAG Query Engine |
  | PDF Text Extract |                             | Query Embedding  |
  | Page Tracking    |                             | Vector Cosine Sim|
  | Semantic Chunks  |                             | Context Prompt   |
  | Embeddings Gen   |                             | Grounded LLM Resp|
  +--------+---------+                             +---------+--------+
           |                                                 |
           +------------------------+------------------------+
                                    |
                  +-----------------v-----------------+
                  |          MongoDB Database         |
                  | Users • Docs • Vector Embeddings  |
                  |            Chat History           |
                  +-----------------------------------+
```

---

## ✨ Key Features

- 📑 **Page-Aware PDF Parsing**: Extracts text page-by-page from uploaded documents using `pdf-parse`.
- ✂️ **Semantic Text Chunking**: Splits extracted text into 800-character overlapping chunks with 150-character overlap while preserving exact page number metadata.
- 🧮 **Vector Embedding Pipeline**: Generates dense vector embeddings for document chunks using Google Gemini `text-embedding-004` (with offline fallback vector generator).
- 🔍 **Cosine Similarity Vector Search**: High-efficiency vector retrieval engine matching query vectors against MongoDB chunk collections with document scope filtering.
- 📖 **Interactive PDF Side-by-Side Viewer & Citation Page Jump**: Click any `[Page X]` citation badge in an AI response to open the inline PDF viewer and automatically jump directly to **Page X** visually.
- 💬 **Multi-Turn Conversation Memory**: Maintains context from previous chat turns so users can ask contextual follow-up questions naturally.
- 🎯 **Document Scope Filtering**: Option to scope vector retrieval to **All Uploaded Documents** or a **Single Selected PDF**.
- 🤖 **Grounded RAG LLM Responses**: Combines retrieved context snippets into structured system prompts, querying Gemini API (`gemini-1.5-flash`) to generate answers with `[Page X]` citations.
- 📋 **Copy to Clipboard & Markdown**: Copy AI answers with one click and render rich markdown syntax.
- 🛡️ **JWT Security & Auth**: Password hashing with `bcryptjs`, token-based authorization for all document, file stream, and chat routes.
- 🎨 **Modern Dark-Mode Glassmorphic UI**: Dashboard built with React 18, Tailwind CSS, Lucide icons, Framer Motion, and dynamic layout scaling.
- 🐳 **Containerized Deployment**: Ready-to-deploy `docker-compose.yml` for MongoDB, Express Backend, and React Frontend.

---

## 📁 Complete Project Structure

```
documind-rag/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js     # User registration & login
│   │   ├── documentController.js # PDF upload, extraction, chunking, vector indexing, file streaming
│   │   ├── chatController.js     # Query embedding, vector search, grounded LLM prompt, history log
│   │   └── historyController.js  # Chat history listing & clear
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification
│   │   └── uploadMiddleware.js   # Multer storage configuration for PDF uploads
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Document.js           # Document metadata schema
│   │   ├── Chunk.js              # Chunk & vector embedding schema
│   │   └── ChatHistory.js        # Chat history & citation metadata schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── chatRoutes.js
│   │   └── historyRoutes.js
│   ├── services/
│   │   ├── pdfService.js         # PDF page-by-page text extraction
│   │   ├── chunkerService.js     # Text chunker with page retention
│   │   ├── embeddingService.js   # Gemini API / Local vector generator
│   │   ├── vectorStoreService.js # Cosine similarity vector search over MongoDB
│   │   └── llmService.js         # Grounded prompt builder & Gemini LLM caller
│   ├── uploads/                  # Physical PDF storage directory
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Main Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Glassmorphic header with user controls & API health check
│   │   │   ├── DocumentUpload.jsx# PDF drag-and-drop uploader with progress state
│   │   │   ├── DocumentList.jsx  # Card list of uploaded files with preview & delete actions
│   │   │   ├── ChatWindow.jsx    # Interactive thread with document filtering & prompt suggestions
│   │   │   ├── ChatMessage.jsx   # Message bubble with markdown, copy button & citation badges
│   │   │   ├── PdfViewerPanel.jsx# Interactive side-by-side PDF previewer with page jump controls
│   │   │   └── SourceModal.jsx   # Context chunk viewer modal
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx      # Login and Sign-up forms
│   │   │   └── DashboardPage.jsx # 3-Column workspace combining documents, chat & PDF viewer
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state provider & token persistence
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT interceptor
│   │   ├── App.jsx
│   │   ├── index.css             # Glassmorphic styles & custom scrollbars
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore                    # Prevents uploading .env keys & node_modules to GitHub
├── docker-compose.yml             # Orchestration for MongoDB, Backend, and Frontend
└── README.md
```

---

## ⚡ Step-by-Step Local Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI
- Google Gemini API Key (Optional — fallback vector generator & context synthesis included)

### 1. Environment Configuration

Copy the environment template in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rag_chatbot
JWT_SECRET=super_secret_jwt_key_rag_chatbot_2026
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here...
```

### 2. Install & Start Backend

```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 3. Install & Start Frontend

In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🐳 Docker Deployment

To spin up the complete MERN + MongoDB stack in isolated containers with a single command:

```bash
docker-compose up --build
```

---

## 💼 Resume Bullet Points

> Built a full-stack Retrieval-Augmented Generation (RAG) Document Intelligence application using the MERN stack (MongoDB, Express.js, React, Node.js). Implemented page-aware PDF text extraction, semantic chunking (800 chars, 150 overlap), vector embeddings with Gemini API (`text-embedding-004`), and high-efficiency Cosine Similarity vector search over MongoDB chunk collections. Engineered grounded LLM prompt assembly to return answers with interactive side-by-side PDF page citations (`[Page X]`), multi-turn conversation memory, JWT authentication, and a responsive 3-column glassmorphic React interface containerized with Docker.
