import {GoogleGenerativeAI} from '@google/generative-ai'
import { cleanGeminiResponse } from '../utils/cleanGeminiResponse.utils.js'

const customGeminiApi = async (req, res, next)=>{
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        const prompt = `You are a JSON generator for academic question banks. Based on the text I provide, the number of questions, and the difficulty level, generate a JSON object that follows this structure:  

        {
          "title": "<Insert the title of the question bank>",
          "description": "<Insert a brief description>",
          "questions": [
            {
              "questionNumber": "<The question number which you will increment after each question>",
              "question": "<A question generated based on the input text>",
              "options": [
                "<Option 1 - A plausible answer based on the text>",
                "<Option 2 - A plausible answer based on the text>",
                "<Option 3 - A plausible answer based on the text>",
                "<Option 4 - A plausible answer based on the text>"
              ],
              "answer": "<The correct option (written in full, not just the letter) or an empty string if unknown>"
            }
          ]
        }
        
        ### Now Your Turn:  
        Please generate a JSON object for the following input:  
        
        - **Text:** '${req.recognizedText}'  
        - **Number of Questions:** '${req.numQuestions}'  
        - **Difficulty Level:** '${req.difficulty}'  
        
        **Instructions:**  
        - Generate '${req.numQuestions}' multiple-choice questions based on '${req.recognizedText}'.  
        - Ensure all questions and answers are derived from '${req.recognizedText}'.  
        - Maintain the difficulty level as '${req.difficulty}'.  
        - Each question should have **four** well-structured answer choices.  
        - Provide the correct answer as a **complete string**, not just an option letter.  
        - Ensure the response is in **pure JSON format**, starting with '{' and ending with '}'.`
        
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

export { customGeminiApi }