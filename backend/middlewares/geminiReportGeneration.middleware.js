import {GoogleGenerativeAI} from '@google/generative-ai'
import { cleanCustomGeminiResponse } from '../utils/cleanCustomGeminiResponse.utils.js'

const customGeminiApiNew = async (req, res, next)=>{
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        const prompt = `You are an AI that generates structured quiz attempt reports in JSON format.
        Your task is to take a JSON object containing quiz attempt details and generate a detailed, structured JSON report with the following format:
        {
            "strongRegions": "the field where the user is strong conceptually",
            "areasOfImprovement": "the areas where improvement is required",
            "susggestedApproach": "suggest an approach to make the user strong in the weak fields"
        }
        The response should be a pure json response and it should as elaborate as possible
        JSON input object ${req.attempt}
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