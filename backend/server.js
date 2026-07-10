import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { error } from 'console';
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js"
//es6 modul __dirname alternative

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashCardRoutes from './routes/flashCardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const __filename=fileURLToPath(import.meta.url)
const __dirname= path.dirname(__filename);

//express app
const app=express();

//connect to MongoDB
connectDB();


const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173", // Local testing ke liye
    "http://localhost:3000"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Agar request bina origin ke ho (jaise Postman) ya allowed list mein ho
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

//static folder for uploads
// Ye line ensure karegi ki /uploads path, uploads/documents folder ko point kare
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes 
app.use('/api/auth',authRoutes);
app.use('/api/documents',documentRoutes)
app.use('/api/flashcards', flashCardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
// 404 handler 
app.use((req,res)=>{
    res.status(404).json({
        success: false,
        error: 'Route not found',
        statusCode:404
    });
});

app.use(errorHandler);

//start server
const PORT=process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})

process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.message}`);
    process.exit(1);
})