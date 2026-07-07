import express from 'express';

import {
    getAllFlashCardsSets,
    getFlashCards,
    reviewFlashCard,
    toggleStarFlashCard,
    deleteFlashCardSet,
}  from '../controllers/flashCardController.js';
import  protect  from '../middleware/auth.js';
const router=express.Router();
router.use(protect);

router.get('/', getAllFlashCardsSets);
router.get('/:documentId', getFlashCards);
router.post('/:cardId/review', reviewFlashCard);
router.post('/:cardId/star', toggleStarFlashCard);
router.delete('/:id', deleteFlashCardSet);

export default router;