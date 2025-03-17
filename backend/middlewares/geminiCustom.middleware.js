import {GoogleGenerativeAI} from '@google/generative-ai'
import { cleanGeminiResponse } from '../utils/cleanGeminiResponse.utils.js'

const customGeminiApi = async (req, res, next)=>{
    try {
      console.log(req.body.numQuestions)
        console.log(req.body.difficulty)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        const prompt = `You are a JSON generator for academic question banks. Based on the given text, number of questions, and difficulty level, generate a JSON object that follows this strict structure:

        {
          "title": "<Insert a concise, relevant title>",
          "description": "<Insert a brief description>",
          "questions": [
            {
              "questionNumber": "<A sequential number starting from 1>",
              "question": "<A well-structured question based strictly on the input text>",
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
        
        ---
        
        ### STRICT RULES:**
         **You must generate exactly ${req.body.numQuestions} questions.**  
           - No more, no less.  
           - If you fail to follow this, your response will be rejected.  
        
         **Maintain the difficulty level as '${req.body.difficulty}'.**  
           - Easy: Questions should be simple and direct.  
           - Medium: Questions should require some reasoning.  
           - Hard: Questions should be complex and require deep understanding.  
        
         **Your response must be a valid JSON object.**  
           - Do not include extra text, explanations, or Markdown formatting.
        ### **Now, generate the JSON using the following inputs:**
        - **Text:** '${req.recognizedText}'  
        - **Number of Questions:** '${req.body.numQuestions}'  
        - **Difficulty Level:** '${req.body.difficulty}'  
        
        **Ensure your response follows all the rules strictly. If any rule is broken, your response will be discarded.**  `
        
        
        const result = await model.generateContent(prompt) 
        const responseText = result.response.text()
        const cleanedResponse = cleanGeminiResponse(responseText)
        const quizData = JSON.parse(cleanedResponse)
        console.log(quizData)
        req.quizData = quizData
        
        next()
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

export { customGeminiApi }