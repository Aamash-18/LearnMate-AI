# LearnMate AI

LearnMate AI is a web application that helps students study using AI. Users can upload PDF documents, ask questions, generate summaries, create flashcards, and take quizzes based on their study materials.

## Features

- User registration and login
- Upload and manage PDF documents
- Ask questions about uploaded documents
- Generate AI-based summaries
- Create and review flashcards
- Generate and attempt quizzes
- View learning progress

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI:** Google Gemini API
- **Other Tools:** Cloudinary, JWT, MongoDB Atlas Vector Search

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd LearnMate-AI
```

### 2. Start the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=8000
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend/ai-learning-assistent
npm install
npm run dev
```

Open the local URL shown in your terminal to use the application.

## Environment Variables

Add your own API keys and database credentials in the `.env` file. Do not upload these credentials to GitHub.

## Note

MongoDB Atlas Vector Search and valid Gemini and Cloudinary credentials are required for the related features to work.
