import {GoogleGenerativeAI} from '@google/generative-ai'
import { cleanGeminiResponse } from '../utils/cleanGeminiResponse.utils.js'

const customGeminiApiNew = async (req, res)=>{
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        const prompt = `
        Generate a detailed quiz analysis report based on the following attempt data. The response should include a title, accuracy percentage, strengths (array of strings), weaknesses (array of strings), areas to look into (array of strings), and a detailed report (text with paragraphs separated by newlines).

The output should be a JSON object with the following structure:
{
  "title": "Quiz Title",
  "accuracy": 75.5,
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "areas_to_look_into": ["Area 1", "Area 2", "Area 3"],
  "detailed_report": "Paragraph 1 with analysis.\n\nParagraph 2 with more insights.\n\nParagraph 3 with recommendations."
}

Here's the attempt data:
${res.attempt}

Analyze this attempt data and provide meaningful insights about the user's performance, identifying specific strengths, weaknesses, and areas for further study. The report should be personalized and actionable.
        `
        
        const result = await model.generateContent(prompt) 
        const responseText = result.response.text()
        console.log(res.attempt);
        const resText = cleanGeminiResponse(responseText)
        res.status(200).json(resText)
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

export { customGeminiApiNew }