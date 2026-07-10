import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os'; // 👈 1. Yeh import add kiya temporary OS paths ke liye

// 👈 2. Humne purana __dirname aur local 'uploads' directory wala code hata diya hai, 
// kyunki Render par custom write permissions block hoti hain.

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // os.tmpdir() automatically:
        // - Local Windows par: C:\Users\AppData\Local\Temp lega
        // - Render Server par: /tmp folder lega
        const tempDir = os.tmpdir();
        
        console.log("Multer file save karne ki koshish kar raha hai yahan:", tempDir);
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// Only PDF files allowed
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    }
});

export default upload;