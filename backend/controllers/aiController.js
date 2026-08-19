import Document from '../models/Document.js';
import Flashcard from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/vectorSearch.js';

//@desc Generate flashcards for a document
//@route POST /api/ai/generate-flashcards
//@access Private
export const generateFlashcards = async (req, res, next) => {
    try{
        const { documentId, count=10 } = req.body;
        if(!documentId){
            return res.status(400).json({success: false, message: 'Document ID is required' });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });
        if(!document){
            return res.status(404).json({success: false, message: 'Document not found or not ready', statusCode: 404    });
        }
        //Generate flashcards using Gemini
        const cards = await geminiService.generateFlashcards(document.extractedText, count);

        const flashcardSet=await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty
            }))
        });
        res.status(201).json({ success: true, data: flashcardSet, message: 'Flashcards generated successfully'  });
    }catch(error){
        next(error);
    }
};

//@desc Generate quiz for a document
//@route POST /api/ai/generate-quiz
//@access Private
export const generateQuiz = async (req, res, next) => {
   try{
        const {documentId, numQuestions=5, title} = req.body;
        if(!documentId){
            return res.status(400).json({success: false, message: 'Document ID is required' });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });
        if(!document){
            return res.status(404).json({success: false, message: 'Document not found or not ready', statusCode: 404    });
        }
        //Generate quiz using Gemini
        const questions= await geminiService.generateQuiz(document.extractedText, parseInt(numQuestions));

        const quiz= await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `Quiz for ${document.title}`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });
        res.status(201).json({ success: true, data: quiz, message: 'Quiz generated successfully'  });

   }catch(error){
        next(error);
    }    
};

//@desc Generate summary for a document
//@route POST /api/ai/generate-summary
//@access Private
export const generateSummary = async (req, res, next) => {
    try{
        const documentId = req.body.documentId;
        if (!documentId) {
            return res.status(400).json({ success: false, message: 'Document ID is required' , statusCode: 400});
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found or not ready', statusCode: 404 });
        }
        const summary = await geminiService.generateSummary(document.extractedText);
        res.status(200).json({ success: true, data: summary, message: 'Summary generated successfully' });
    }catch(error){
        next(error);
    }



};

//@desc Chat with AI about a document
//@route POST /api/ai/chat
//@access Private
export const chat = async (req, res, next) => {
    try{
        const { documentId, question } = req.body;
        if (!documentId || !question) {
            return res.status(400).json({ success: false, message: 'Document ID and question are required', statusCode: 400 });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found or not ready', statusCode: 404 });
        }

        const relevantChunks = await findRelevantChunks(
            document._id,
            question,
            3
        );

        const chunksIndices = relevantChunks.map(c => c.chunkIndex);
        
        //Get or Create chat history for this document
        let chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId: document._id });
        if (!chatHistory) {
            chatHistory = await ChatHistory.create({ userId: req.user._id, documentId: document._id, messages: [] });
        }
        // Generate answer using Gemini
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        // Save user question and AI answer to chat history
        chatHistory.messages.push(
            { role: 'user', content: question, timestamp: new Date(), releventChunk: [] },
            { role: 'assistant', content: answer, timestamp: new Date(), releventChunk: chunksIndices }
        );
        await chatHistory.save();
        res.status(200).json({
            success: true,
            data:{
                question,
                answer,
                relevantChunks: chunksIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Chat response generated successfully'
        })
    }catch(error){
        next(error);
    }
};

//@desc Explain a concept from a document
//@route POST /api/ai/explain-concept
//@access Private
export const explainConcept = async (req, res, next) => {
    try{
        const {documentId, concept}=req.body;
        if(!documentId || !concept){
            return res.status(400).json({success: false, message: 'Document ID and concept are required', statusCode: 400 });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });
        if(!document){
            return res.status(404).json({success: false, message: 'Document not found or not ready', statusCode: 404    });
        }
        const relevantChunks = await findRelevantChunks(
            document._id,
            concept,
            5
        );
        const context = relevantChunks.map(c => c.content).join('\n\n');
        const explanation = await geminiService.explainConcept(concept, context);
        res.status(200).json({ 
            success: true, 
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex)
            }, message: 'Concept explained successfully' });
    }catch(error){
        next(error);
    }

};


//@desc Get chat history for a document
//@route GET /api/ai/chat-history/:documentId
//@access Private
export const getChatHistory = async (req, res, next) => {
    try{
        const { documentId } = req.params;
        if(!documentId){
            return res.status(400).json({success: false, message: 'Document ID is required', statusCode: 400 });
        }
        const chatHistory = await ChatHistory.findOne({ userId: req.user._id, documentId }).select('messages');
        if(!chatHistory){
            return res.status(200).json({
                success: true, 
                data: { messages: [] }, 
                message: 'No chat history found', 
                statusCode: 200
            });
        }
        res.status(200).json({ success: true, data: { messages: chatHistory.messages }, message: 'Chat history retrieved successfully', statusCode: 200 });
    }catch(error){
        next(error);
    }

};

//
