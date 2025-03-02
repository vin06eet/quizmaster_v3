import express from 'express'
import authenticate from '../middlewares/auth.middleware.js'
import { 
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    uploadQuiz,
    attemptQuiz,
    submitQuiz,
    getAttempt,
    getAllAttempts,
    getAllPublicQuizzes,
    saveQuestion,
    saveQuizAttempt,
    createAttempt,
    getMyQuizzes
} from '../controllers/quiz.controller.js'

const router = express.Router()

router.get('/quiz', authenticate, getAllQuizzes)
router.get('/quiz/:id', authenticate, getQuizById)
router.patch('/quiz/:id', authenticate, updateQuiz) //works fine
router.delete('/quiz/:id', authenticate, deleteQuiz)
router.post('/quiz', authenticate, uploadQuiz)
router.get('/quiz/attempt/:id', authenticate, attemptQuiz)
router.post('/quiz/attempt/:id', authenticate, submitQuiz)
router.get('/quiz/attempt/:id', authenticate, getAttempt)
router.get('/quiz/attempt', authenticate, getAllAttempts)
router.get('/quiz/public/get',authenticate, getAllPublicQuizzes)
router.patch('/quiz/attempt/save/question/:id', authenticate, saveQuestion) // works fine
router.patch('/quiz/attempt/save/:id', authenticate, saveQuizAttempt) //works fine
router.post('/quiz/attempt/create/:id', authenticate, createAttempt) // works but doesnot terminate in postman
router.get('/myQuizzes', authenticate, getMyQuizzes)

export default router