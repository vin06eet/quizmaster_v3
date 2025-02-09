import express from 'express'
import { upload } from '../middlewares/multer.middleware.js'
import { uploadAndOcr } from '../middlewares/uploadAndOcr.middleware.js';
import { geminiApi } from '../middlewares/gemini.middleware.js';
import { uploadQuiz } from '../controllers/quiz.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/fileUpload.middleware.js';
const router = express.Router()

//works fine
router.post('/upload', upload.single('file'), uploadImage , uploadAndOcr, geminiApi, authenticate, uploadQuiz)

export default router
