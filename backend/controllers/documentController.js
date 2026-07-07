import Document from "../models/Document.js";
import FlashCard from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from "mongoose";

// @desc Upload a document
// @route POST /api/documents/

// @access Private
export const uploadDocument=async(req,res,next)=>{
    try {
        if(!req.file){
            return res.status(400).json({
                success:false,
                error:'No file uploaded',
                statusCode:400
            });
        }
        const {title}=req.body;
        if(!title){
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success:false,
                error:'Title is required',
                statusCode:400
            });
        }
        // construct url for the uploaded file
        const baseUrl=`http://localhost:${process.env.PORT || 8000}`;
        const fileUrl=`${baseUrl}/uploads/documents/${req.file.filename}`;

        //Create Document entry in the database
        const document=await Document.create({
            userId: req.user.id,
            title,
            fileName:req.file.originalname,
            filePath:fileUrl,
            fileSize:req.file.size,
            status: 'processing'
        });

        // Process the document in the background
        processPDF(document._id,req.file.path).catch(async(error)=>{
            console.error('Error processing PDF:',error);
            await Document.findByIdAndUpdate(document._id,{status:'failed'});
        });
        res.status(201).json({
            success:true,
            data:document,
            message:'Document uploaded successfully. Processing in background.',
            statusCode:201
        });

    }catch (error) {    
        if(req.file){
            await fs.unlink(req.file.path).catch(()=>{});
        }
        next(error);
    }
};

//Helper function to process the PDF
const processPDF=async(documentId,filePath)=>{
  try {
     const pdfResult = await extractTextFromPDF(filePath);
    
    // 2. Object ke andar se 'text' string ko nikalein
    // Agar direct string aati hai toh backup ke liye 'pdfResult' khud use ho jayega
    const text = typeof pdfResult === 'object' && pdfResult.text ? pdfResult.text : pdfResult;
    //Chunk the text into smaller pieces
    const chunks=chunkText(text,500,50); // chunk size of 1000 characters

    //Update the document with extracted text and chunks
    await Document.findByIdAndUpdate(documentId,{
        extractedText:text,
        chunks:chunks,
        status:'ready'
    });
    console.log(`Document ${documentId} processed successfully`);
    }catch (error) {
            console.error(`Error processing document ${documentId}:`,error);
            await Document.findByIdAndUpdate(documentId,{status:'failed'});
    }
    finally {
        // await fs.unlink(filePath).catch((err)=>{
        //     console.error(`Error deleting file ${filePath}:`,err);
        // }
        
    }
};

// @desc Get all documents for the logged-in user
// @route GET /api/documents
// @access Private
export const getDocuments=async(req,res,next)=>{
    const documents = await Document.find({ userId: new mongoose.Types.ObjectId(req.user.id) })
        .sort({ uploadDate: -1 })
        .lean();

    const documentsWithCounts = await Promise.all(
        documents.map(async (doc) => {
            const idMatch = { $in: [doc._id, doc._id.toString()] };
            const [flashCardsCount, quizCount] = await Promise.all([
                FlashCard.countDocuments({ documentId: idMatch }),
                Quiz.countDocuments({ documentId: idMatch }),
            ]);
            return {
                ...doc,
                flashCardsCount,
                quizCount,
            };
        }),
    );

    res.status(200).json({
        success:true,
        count: documentsWithCounts.length,
        data:documentsWithCounts,
    });
};

// @desc Get a single document by ID
// @route GET /api/documents/:id
// @access Private
export const getDocument=async(req,res,next)=>{
    const document=await Document.findOne({_id:req.params.id,userId:req.user._id});
    if(!document){
        return res.status(404).json({
            success:false,
            error:'Document not found',
            statusCode:404
        });
    }   
    //get count of flashcards and quizzes, matching both ObjectId and string IDs
    const idMatch = { $in: [document._id, document._id.toString()] };
    const flashCardsCount = await FlashCard.countDocuments({ documentId: idMatch });
    const quizCount = await Quiz.countDocuments({ documentId: idMatch });
    //update last accessed date
    document.lastAccessed = new Date();
    await document.save();
    //combine document data with flashcards and quiz count
    const documentData = document.toObject();
    documentData.flashCardsCount = flashCardsCount;
    documentData.quizCount = quizCount;
    res.status(200).json({
        success:true,
        data:documentData
    });
};


// @desc Delete a document by ID
// @route DELETE /api/documents/:id
// @access Private
export const deleteDocument=async(req,res,next)=>{
    try{
        const document=await Document.findOne({_id:req.params.id,userId:req.user._id});
    if(!document){
        return res.status(404).json({
            success:false,
            error:'Document not found',
            statusCode:404
        });
    }
    await fs.unlink(document.filePath).catch(()=>{});
    // delete the file from uploads folder;
    await document.deleteOne();
    res.status(200).json({
        success:true,
        message:'Document deleted successfully'
    });
    }catch(error){
        next(error);
    }
};
