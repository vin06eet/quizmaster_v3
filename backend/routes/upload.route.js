import express from 'express'
import { upload } from '../middlewares/multer.middleware.js'
import { uploadAndOcr } from '../middlewares/uploadAndOcr.middleware.js';
import { geminiApi } from '../middlewares/gemini.middleware.js';
import { uploadQuiz } from '../controllers/quiz.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/fileUpload.middleware.js';
import { customGeminiApi } from '../middlewares/geminiCustom.middleware.js';
import { customGeminiApiNew } from '../middlewares/geminiReportGeneration.middleware.js';
import getAttempt from '../middlewares/getAttempt.middleware.js';
import generatePDF from '../controllers/pdfDownload.controller.js';
import { customTextGeminiApi } from '../middlewares/customTextGeminiApi.middleware.js';
const router = express.Router()

//works fine
router.post('/upload', upload.single('file'), uploadImage , uploadAndOcr, geminiApi, authenticate, uploadQuiz)
router.post('/upload/custom', upload.single('file'), uploadImage, uploadAndOcr, customGeminiApi, authenticate, uploadQuiz);
router.post('/create/custom/quiz', authenticate, customTextGeminiApi, uploadQuiz);
router.post('/test/route/:id', authenticate, getAttempt, customGeminiApiNew)

export default router
