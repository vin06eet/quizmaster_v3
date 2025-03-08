import tesseract from "tesseract.js";
import { convertPdfToImages } from "../utils/convertPdf.js"; // Corrected import
import fs from "fs";

const uploadAndOcr = async (req, res, next) => {
    try {
        const fileUrl = req.fileUrl;
        console.log(`Uploaded File URL: ${fileUrl}`);

        let extractedText = "";

        if (fileUrl.endsWith(".pdf")) {
            console.log("Processing PDF file...");
            const images = await convertPdfToImages(fileUrl);

            for (const imgPath of images) {
                console.log(`Processing image: ${imgPath}`);
                const { data: { text } } = await tesseract.recognize(imgPath, "eng");
                extractedText += text + "\n\n";

                // Delete temporary images
                fs.unlinkSync(imgPath);
            }
        } else {
            console.log("Processing image file...");
            const { data: { text } } = await tesseract.recognize(fileUrl, "eng");
            extractedText = text;
        }

        console.log(`Recognized Text: ${extractedText}`);
        req.recognizedText = extractedText;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { uploadAndOcr };
