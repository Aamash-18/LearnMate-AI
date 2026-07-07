import FlashCard from '../models/FlashCard.js';

// @desc    Get all flash card sets for the authenticated user
// @route   GET /api/flashcards
// @access  Private
export const getAllFlashCardsSets = async (req, res, next) => {
    try{
        const flashCardSets= await FlashCard.find({ userId: req.user._id })
        .populate('documentId', 'title fileName')
        .sort({createdAt: -1 });
        res.status(200).json({
            success: true,
            count: flashCardSets.length,
            data: flashCardSets,
        });
    }catch(error){
        next(error);
    }
};

// @desc    Get flash cards for a specific document
// @route   GET /api/flashcards/:documentId
// @access  Private
export const getFlashCards = async (req, res, next) => {
    try{
        const flashCards= await FlashCard.find({ userId: req.user._id, documentId: req.params.documentId })
        .populate('documentId', 'title fileName')
        .sort({createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashCards.length,
            data: flashCards,
        })
    }catch(error){
        next(error);
    }
};

// @desc    Review a flash card (update review data)
// @route   POST /api/flashcards/:cardId/review
// @access  Private
export const reviewFlashCard = async (req, res, next) => {
    try{
        const flashCardSet= await FlashCard.findOne({ 'cards._id': req.params.cardId, userId: req.user._id });
        if(!flashCardSet){
            return res.status(404).json({ success: false, error: 'Flash card not found', status: 404 });
        }
        const cardIndex= flashCardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        if(cardIndex === -1){
            return res.status(404).json({ success: false, error: 'Flash card not found', status: 404 });
        }
        flashCardSet.cards[cardIndex].lastReviewed= new Date();
        flashCardSet.cards[cardIndex].reviewCount += 1;
        await flashCardSet.save();
        res.status(200).json({
            success: true,
            data: flashCardSet,
            message: 'Flash card reviewed successfully',
        });
    }catch(error){
        next(error);
    }
};

// @desc    Toggle star status of a flash card
// @route   POST /api/flashcards/:cardId/star
// @access  Private
export const toggleStarFlashCard = async (req, res, next) => {
    try{
        const flashCardSet= await FlashCard.findOne({ 'cards._id': req.params.cardId, userId: req.user._id });
        if(!flashCardSet){
            return res.status(404).json({ success: false, error: 'Flash card not found', status: 404 });
        }
        const cardIndex= flashCardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        if(cardIndex === -1){
            return res.status(404).json({ success: false, error: 'Flash card not found', status: 404 });
        }
        flashCardSet.cards[cardIndex].isStarred= !flashCardSet.cards[cardIndex].isStarred;
        await flashCardSet.save();
        res.status(200).json({
            success: true,
            data: flashCardSet,
            message: 'Flash card star status toggled successfully',
        });

    }catch(error){
        next(error);
    }
};  

// @desc    Delete a flash card set
// @route   DELETE /api/flashcards/:id
// @access  Private
export const deleteFlashCardSet = async (req, res, next) => {
    try{
        const flashCardSet= await FlashCard.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if(!flashCardSet){
            return res.status(404).json({ success: false, error: 'Flash card set not found', status: 404 });
        }
        res.status(200).json({
            success: true,
            message: 'Flash card set deleted successfully',
        });
        
    }catch(error){
        next(error);
    }
};
