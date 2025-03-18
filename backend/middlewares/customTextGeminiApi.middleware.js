import {GoogleGenerativeAI} from '@google/generative-ai'
import { cleanGeminiResponse } from '../utils/cleanGeminiResponse.utils.js'

const customTextGeminiApi = async (req, res, next)=>{
    try {
      console.log(req.body.numQuestions)
        console.log(req.body.difficulty)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        const prompt = `You are a JSON generator for academic question banks. Based on the given title, description, number of questions, and difficulty level, generate a JSON object that follows this strict structure:
        {
            "title": "<Insert the given title>",
            "description": "<Insert the given description>",
            "questions": [
              {
                "questionNumber": "<A sequential number starting from 1>",
                "question": "<A well-structured question relevant to the given title and description>",
                "options": [
                  "<Option 1 - A plausible answer>",
                  "<Option 2 - A plausible answer>",
                  "<Option 3 - A plausible answer>",
                  "<Option 4 - A plausible answer>"
                ],
                "answer": "<The correct option (written in full, not just the letter) or an empty string if unknown>"
              }
            ]
          }
          STRICT RULES:
          Generate exactly ${req.body.numQuestions} questions.
          
          No more, no less.
          If this rule is broken, your response will be rejected.
          Follow the given difficulty level: '${req.body.difficulty}'.
          
          Easy: Questions should be straightforward and factual.
          Medium: Questions should require some reasoning.
          Hard: Questions should be complex and require deep understanding.
          Ensure all questions are strictly relevant to the given title and description.
          
          Your response must be a valid JSON object.
          
          Do not include extra text, explanations, or Markdown formatting.
          Now, generate the JSON using the following inputs:
          Title: '${req.body.title}'
          Description: '${req.body.description}'
          Number of Questions: '${req.body.numQuestions}'
          Difficulty Level: '${req.body.difficulty}'
          Failure to follow these rules exactly will result in rejection.                    
        `
        
        
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

export { customTextGeminiApi }