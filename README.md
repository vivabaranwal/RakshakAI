# 🛡️ Rakshak AI

Rakshak AI is an AI-powered legal contract analysis platform designed to help users quickly identify risks, understand complex legal jargon, and analyze contracts with ease. Built with a robust backend using Python/FastAPI and a modern React frontend, Rakshak AI provides deterministic clause analysis, interactive PDF visualization, and a conversational interface to chat directly with your document.

## ✨ Features

- **Document Analysis**: Upload PDF agreements and automatically extract text alongside visual bounding box coordinates.
- **Risk Assessment**: Uses advanced LLMs (via Groq API) to extract clauses, assign fairness scores, and flag potential high-risk pitfalls.
- **Interactive PDF Viewer**: Highlights categorized clauses directly on the document preview so users can read them in context.
- **Talk to PDF (RAG Chatbot)**: A cyber-legal themed chat interface allowing users to query specific terms and summarize the uploaded agreement.
- **Persistent State**: Background processing and SQLite database to save your document analysis securely.

## 🛠️ Tech Stack

### Frontend
- **React 19 & Vite**
- **TailwindCSS & Framer Motion** (for modern, dynamic, and aesthetic UI/UX)
- **Zustand** (for state management)
- **react-pdf-highlighter** (for bounding box annotations)

### Backend
- **Python & FastAPI**
- **SQLite & SQLAlchemy** (for database and ORM management)
- **Groq API (Llama-3.3-70b-versatile)** (for LLM inference)
- **PyMuPDF / Fitz** (for text & bounding box extraction)

---

## 🚀 Getting Started

Follow these steps to run Rakshak AI locally. You will need two separate terminal windows for the frontend and backend.

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- A Groq API Key

### 1. Backend Setup

Open your first terminal and navigate to the `backend` directory:

```bash
cd backend
```

**Create and activate the virtual environment:**
```bash
# Assuming Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Install dependencies:**
*(Ensure you have your respective dependencies installed via your `requirements.txt` if available)*
```bash
pip install "fastapi[standard]" sqlalchemy python-dotenv groq PyMuPDF python-multipart
```

**Set Environment Variables:**
Create a `.env` file in the `backend` folder and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

**Run the Backend Server:**
```bash
uvicorn app.main:app --reload
```
*The backend will be available at `http://127.0.0.1:8000`*

### 2. Frontend Setup

Open your second terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

**Install Dependencies:**
```bash
npm install
```

**Set Environment Variables:**
Create a `.env` file in the `frontend` folder (if needed for any specific API routes, though Vite typically proxies or connects directly to the backend URL):
```env
VITE_API_URL=http://localhost:8000
```

**Run the Frontend Development Server:**
```bash
npm run dev
```
*The web app will be available at `http://localhost:5173`*

---

## 📂 Project Structure

```
RakshakAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/       # PDF Extraction & API processing logic
│   │   ├── main.py         # FastAPI instance
│   │   ├── models.py       # SQLAlchemy Document & Clause Models
│   │   └── database.py     # SQLite init
│   └── tests/
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, SharedUI, Chatbot, Document Viewer
    │   ├── pages/          # LandingPage, Contact
    │   └── index.css       # Tailwind entry and global styles
    ├── package.json
    └── tailwind.config.js
```

## 📜 License
This project is proprietary and built for demonstration / specialized legal AI analysis.
