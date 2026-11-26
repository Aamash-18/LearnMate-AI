import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { error } from 'console';
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js"
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashCardRoutes from './routes/flashCardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const __filename=fileURLToPath(import.meta.url)
const __dirname= path.dirname(__filename);

const app=express();

connectDB();


const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    process.env.FRONTEND_URL || '',
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                // Allow requests without origin (mobile apps, Postman)
                return callback(null, true);
            }
            
            // Check if origin is in allowed list
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            
            // Allow any Vercel deployment
            if (origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }
            
            // Deny other origins
            callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        optionsSuccessStatus: 200
    })
);
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth',authRoutes);
app.use('/api/documents',documentRoutes)
app.use('/api/flashcards', flashCardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use((req,res)=>{
    res.status(404).json({
        success: false,
        error: 'Route not found',
        statusCode:404
    });
});

app.use(errorHandler);

const PORT=process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})

process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.message}`);
    process.exit(1);
})
