import tesseract from "tesseract.js";

const uploadAndOcr = async (req, res, next)=>{
    try {
        const fileUrl = req.fileUrl
        console.log(`Uploaded File URL: ${fileUrl}`);
        const { data: { text } } = await tesseract.recognize(fileUrl, 'eng');
        console.log(`Recognized Text: ${text}`);
        req.recognizedText = text
        next()
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export {uploadAndOcr}