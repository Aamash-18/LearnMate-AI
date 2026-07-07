import express from 'express';
import { 
    getQuizes, 
    getQuizById,
    SubmitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';    
const router = express.Router();

router.use(protect);

router.get('/quiz/:id', getQuizById);
router.get('/:documentId', getQuizes);
router.post('/:id/submit', SubmitQuiz);
router.get('/:id/results', getQuizResults);
router.delete('/:id', deleteQuiz);

export default router;