

import Quiz from '../models/Quiz.js';

// @desc Get quizzes for a document
// @route GET /api/quizzes/:documentId
// @access Private
export const getQuizes = async (req, res, next) => {
    try{
        const quizzes = await Quiz.find({userId: req.user.id, documentId: req.params.documentId })
        .populate('documentId', 'title fileName')
        .sort({createdAt: -1});
        res.status(200).json({
            success: true,
            data: quizzes,
            count: quizzes.length
        })

    }catch(error){
        next(error);
    }
};

// @desc Get quiz by ID
// @route GET /api/quizzes/quiz/:id
// @access Private
export const getQuizById = async (req, res, next) => {
    try{
        const quiz = await Quiz.findById(req.params.id);
        if(!quiz){
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        res.status(200).json({
            success: true,
            data: quiz
        });

    }catch(error){
        next(error);
    }  
};

// @desc Submit quiz answers
// @route POST /api/quizzes/:id/submit
// @access Private
export const SubmitQuiz = async (req, res, next) => {
    try{
        const {answers} = req.body;
        if(!Array.isArray(answers) || answers.length == 0){
            return res.status(400).json({
                success: false,
                message: 'Answers must be a non-empty array'
            });
        }
        const quiz = await Quiz.findOne({ _id: req.params.id});
        if(!quiz){
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        //process answers and calculate score
        let correctCount=0;
        const userAnswers=[];
        answers.forEach((answerItem)=>{
            let { questionIndex, selectedAnswer, questionId, answer: rawAnswer } = answerItem;
            if (questionId !== undefined && questionIndex === undefined) {
                questionIndex = quiz.questions.findIndex((question) => question._id.toString() === questionId.toString());
            }
            if (rawAnswer !== undefined && selectedAnswer === undefined) {
                selectedAnswer = rawAnswer;
            }
            if (questionIndex < 0 || questionIndex >= quiz.questions.length || typeof questionIndex !== 'number'){
                return res.status(400).json({
                    success: false,
                    message: `Invalid question index: ${questionIndex}`
                });
            }
            const question = quiz.questions[questionIndex];
            const isCorrect = question.correctAnswer === selectedAnswer;
            if(isCorrect) correctCount++;
            userAnswers.push({
                questionIndex,
                selectedAnswer,
                isCorrect,
                answeredAt: new Date()
            });
        });
        //calculate score
        const score = (correctCount / quiz.totalQuestions) * 100;
        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();
        await quiz.save();
        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                totalQuestions: quiz.totalQuestions,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: score,
                userAnswers
            },
            message: 'Quiz submitted successfully'
        
        });



    }catch(error){
        next(error);
    }  
};

// @desc Get quiz results
// @route GET /api/quizzes/:id/results
// @access Private
export const getQuizResults = async (req, res, next) => {
    try{
        const quiz = await Quiz.findOne({userId: req.user.id, _id: req.params.id }).populate('documentId', 'title fileName');
        if(!quiz){
            return res.status(404).json({

                success: false,
                message: 'Quiz not found'
            });
        }
        if(!quiz.completedAt){
            return res.status(400).json({
                success: false,
                message: 'Quiz not completed yet'
            });
        }

        //build detailed results
        const detailedResults = quiz.questions.map((question, index)=>{
            const userAnswer = quiz.userAnswers.find(ans=>ans.questionIndex === index);
            return {
                questionIndex: index,
                question: question.question || question.questionText || "",
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer ? userAnswer.selectedAnswer : null,
                explanation: question.explanation,
            }
        });
        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                title: quiz.title,
                documentId: quiz.documentId,
                score: quiz.score,
                totalQuestions: quiz.totalQuestions,
                detailedResults,
                completedAt: quiz.completedAt
            },
            results: detailedResults
        });
    }catch(error){
        next(error);
    }       
};

// @desc Delete quiz
// @route DELETE /api/quizzes/:id
// @access Private
export const deleteQuiz = async (req, res, next) => {
    try{
        const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, user: req.params.userId });
        if(!quiz){
            return res.status(404).json({

                success: false,
                message: 'Quiz not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    }catch(error){
        next(error);
    }       
};  

