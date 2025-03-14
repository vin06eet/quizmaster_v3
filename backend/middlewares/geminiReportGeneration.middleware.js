import {GoogleGenerativeAI} from '@google/generative-ai'
import { cleanCustomGeminiResponse } from '../utils/cleanCustomGeminiResponse.utils.js'

const customGeminiApiNew = async (req, res, next)=>{
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        const prompt = `You are an AI that generates **detailed quiz attempt reports** in **HTML format**, including **performance analysis**.

        ### **Your Task**
        - Given a **JSON object** with quiz attempt details, generate a **well-structured HTML report**.
        - Highlight **correct** answers in **green**.
        - Highlight **incorrect** answers in **red**.
        - Provide **individual reasoning** for each incorrect answer.
        - **Analyze overall performance** based on:
          - Accuracy percentage
          - Strengths (topics where the user performed well)
          - Weaknesses (topics where the user struggled)
          - Suggested improvement strategies
        
        ---
        JSON input = ${res.attempt}
        `
        
        const result = await model.generateContent(prompt) 
        const responseText = result.response.text()
        res.htmlText = responseText;
        console.log(responseText);
        next();
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

export { customGeminiApiNew }