import {GoogleGenerativeAI} from '@google/generative-ai'
import { cleanGeminiResponse } from '../utils/cleanGeminiResponse.utils.js'

const geminiApi = async (req, res, next)=>{
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        const prompt = `You are a JSON generator for academic question banks. Based on the text I provide, generate a JSON object that follows this structure:
  {
    "title": "<Insert the title of the question bank>",
    "description": "<Insert a brief description>",
    "questions": [
      {
        "questionNumber": "<The question number which you will increment after each question>",
        "question": "<The text of the question>",
        "options": [
          "<Option 1>",
          "<Option 2>",
          "<Option 3>",
          "<Option 4>"
        ],
        "answer": "<The correct answer or an empty string if unknown>"
      }
    ]
  }
  ### Now Your Turn:
  Please generate a JSON object for the following input textf:
 '${req.recognizedText}'
 remember, the structure is the same as the example above and it should be a pure json response, i.e. your response should begin with  '{' and end with a '}'`
        const result = await model.generateContent(prompt) 
        const responseText = result.response.text()
        const cleanedResponse = cleanGeminiResponse(responseText)
        const quizData = JSON.parse(cleanedResponse)
        req.quizData = quizData
        next()
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

export { geminiApi }