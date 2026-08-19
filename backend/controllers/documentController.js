import fs from 'fs/promises';
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import FlashCard from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js';
import crypto from 'crypto';

import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import { generateEmbedding } from '../utils/embeddingUtils.js';

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

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "raw",
        folder: "documents",
        use_filename: true,
        unique_filename: false,
        });

        const fileUrl = uploadResult.secure_url;
        // console.log("File URL", fileUrl);
        const publicId = uploadResult.public_id;

        //Create Document entry in the database
        const document=await Document.create({
            userId: req.user.id,
            title,
            fileName:req.file.originalname,
            filePath:fileUrl,
            cloudinaryPublicId: publicId,
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
const processPDF = async (documentId, filePath) => {
    try {

        const pdfResult = await extractTextFromPDF(filePath);

        const text =
            typeof pdfResult === 'object' && pdfResult.text
                ? pdfResult.text
                : pdfResult;

        // Create chunks from extracted text
        const chunks = chunkText(text, 500, 50);

        // Generate embedding and create separate DocumentChunk
        // document for every chunk
        const chunkDocuments = [];

        for (const chunk of chunks) {

            const embedding = await generateEmbedding(chunk.content);

            chunkDocuments.push({
                documentId: documentId,
                content: chunk.content,
                pageNumber: chunk.pageNumber,
                chunkIndex: chunk.chunkIndex,
                embedding: embedding
            });
        }

        // Store all chunks in the DocumentChunk collection
        if (chunkDocuments.length > 0) {
            await DocumentChunk.insertMany(chunkDocuments);
        }

        // Update only the main Document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            status: 'ready'
        });

        console.log(
            `Document ${documentId} processed successfully. ${chunkDocuments.length} chunks created.`
        );

    } catch (error) {

        console.error(
            `Error processing document ${documentId}:`,
            error
        );

        await Document.findByIdAndUpdate(
            documentId,
            { status: 'failed' }
        );

    } finally {

        await fs.unlink(filePath).catch((err) => {
            console.error(
                `Error deleting file ${filePath}:`,
                err
            );
        });
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
    if (document.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
        resource_type: 'raw',
      }).catch((err) => {
        console.error('Error deleting Cloudinary asset:', err);
      });
    }

    
    await Promise.all([
        FlashCard.deleteMany({ documentId: document._id, userId: req.user._id }),
        Quiz.deleteMany({ documentId: document._id, userId: req.user._id })
    ]);

    await document.deleteOne();
    res.status(200).json({
        success:true,
        message:'Document and related flashcards/quizzes deleted successfully'
    });
    }catch(error){
        next(error);
    }
};

// @desc Get a signed file URL for a document (Cloudinary raw or direct URL)
// @route GET /api/documents/:id/file-url
// @access Private
export const getDocumentFileUrl = async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });
        }

        // If Cloudinary public id exists, generate a signed private download URL
        if (document.cloudinaryPublicId) {
            try {
                // Try to infer format (pdf) from public id or filePath to avoid empty format param
                let format;
                try {
                    const m = document.cloudinaryPublicId.match(/\.([a-z0-9]+)$/i);
                    if (m) format = m[1];
                } catch (e) {}
                if (!format && document.fileName) {
                    const m2 = document.fileName.match(/\.([a-z0-9]+)$/i);
                    if (m2) format = m2[1];
                }
                // Manually construct signed download URL to avoid SDK adding empty params
                const timestamp = Math.floor(Date.now() / 1000);
                const publicIdToSign = document.cloudinaryPublicId;
                const stringToSign = `public_id=${publicIdToSign}&timestamp=${timestamp}`;
                const crypto = await import('crypto');
                const signature = crypto.createHmac('sha1', process.env.CLOUDINARY_API_SECRET).update(stringToSign).digest('hex');
                const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
                const apiKey = process.env.CLOUDINARY_API_KEY;
                const signedUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/download?public_id=${encodeURIComponent(publicIdToSign)}&timestamp=${timestamp}&signature=${signature}&api_key=${apiKey}`;
                // Quick HEAD check to ensure the signed URL is accessible; otherwise fall back to stored filePath
                try {
                    const resp = await fetch(signedUrl, { method: 'HEAD' });
                    if (resp.ok) {
                        return res.status(200).json({ success: true, url: signedUrl });
                    }
                    console.warn('Signed URL HEAD returned', resp.status);
                } catch (headErr) {
                    console.warn('HEAD check failed for signed URL', headErr && headErr.message ? headErr.message : headErr);
                }

                // Fallback: if we have a direct filePath (secure_url), return it
                if (document.filePath && /^https?:\/\//i.test(document.filePath)) {
                    return res.status(200).json({ success: true, url: document.filePath });
                }
                return res.status(500).json({ success: false, error: 'Signed URL inaccessible and no fallback available' });
            } catch (err) {
                console.error('Error generating signed URL:', err);
                return res.status(500).json({ success: false, error: 'Failed to generate signed URL' });
            }
        }

        // If filePath is an absolute URL, return it directly
        if (document.filePath && /^https?:\/\//i.test(document.filePath)) {
            return res.status(200).json({ success: true, url: document.filePath });
        }

        // Otherwise construct a backend-served URL for local files
        const baseUrl = process.env.BASE_URL || (req.protocol + '://' + req.get('host'));
        const cleanBase = baseUrl.replace(/\/$/, '');
        const cleanPath = (document.filePath || '').replace(/^\//, '');
        const url = `${cleanBase}/${cleanPath}`;
        return res.status(200).json({ success: true, url });
    } catch (error) {
        next(error);
    }
};

// @desc Stream a document file to the client (proxy Cloudinary/raw file)
// @route GET /api/documents/:id/stream
// @access Private
export const streamDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
        if (!document) return res.status(404).json({ success: false, error: 'Document not found' });

        // Prefer stored secure_url (Cloudinary) or filePath
        const sourceUrl = document.filePath;
        if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) {
            return res.status(400).json({ success: false, error: 'No remote file available to stream' });
        }

        const fetchRes = await fetch(sourceUrl);
        if (!fetchRes.ok) {
            return res.status(502).json({ success: false, error: 'Failed to fetch remote file' });
        }

        const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';
        const contentLength = fetchRes.headers.get('content-length');
        if (contentLength) res.setHeader('Content-Length', contentLength);
        res.setHeader('Content-Type', contentType);

        // Stream the response body (web stream) to Node response
        const { Readable } = await import('stream');
        if (fetchRes.body?.getReader) {
            // WHATWG ReadableStream -> Node Readable
            const nodeStream = Readable.fromWeb(fetchRes.body);
            nodeStream.pipe(res);
        } else if (fetchRes.body && typeof fetchRes.body.pipe === 'function') {
            // Node stream
            fetchRes.body.pipe(res);
        } else {
            const buf = await fetchRes.arrayBuffer();
            res.send(Buffer.from(buf));
        }
    } catch (error) {
        next(error);
    }
};
