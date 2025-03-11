import axios from "axios";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import tesseract from "tesseract.js";
import dotenv from "dotenv";

dotenv.config();

const tempDir = "/tmp";
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const downloadFile = async (fileUrl, outputPath) => {
    try {
        
        const publicId = fileUrl.split("/").pop().split(".")[0];

        const cloudinaryApiUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/${publicId}.pdf`;

        const response = await axios({
            url: cloudinaryApiUrl,
            method: "GET",
            auth: {
                username: process.env.CLOUDINARY_API_KEY,
                password: process.env.CLOUDINARY_SECRET_KEY
            },
            responseType: "stream",
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            writer.on("finish", () => {
                console.log(`Download complete: ${outputPath}`);
                resolve();
            });
            writer.on("error", (err) => {
                console.error(`Download error: ${err.message}`);
                reject(err);
            });
        });
    } catch (error) {
        console.error(`Failed to download file: ${error.message}`);
        throw new Error("Error downloading file from Cloudinary.");
    }
};

const convertPdfToImages = (pdfPath) => {
    return new Promise((resolve, reject) => {
        const outputPrefix = path.join(tempDir, "pdf_image");

        console.log(`Running pdftoppm on: ${pdfPath}`);

        exec(`pdftoppm -png "${pdfPath}" "${outputPrefix}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`pdftoppm error: ${error.message}`);
                return reject(new Error("Failed to convert PDF to images."));
            }
            console.log(`pdftoppm output: ${stdout}`);
            console.error(`pdftoppm warnings/errors: ${stderr}`);

            fs.readdir(tempDir, (err, files) => {
                if (err) return reject(err);

                const imageFiles = files
                    .filter(file => file.startsWith("pdf_image") && file.endsWith(".png"))
                    .map(file => path.join(tempDir, file));

                if (imageFiles.length === 0) {
                    return reject(new Error("No images generated from PDF."));
                }

                resolve(imageFiles);
            });
        });
    });
};

const uploadAndOcr = async (req, res, next) => {
    try {
        const fileUrl = req.fileUrl; 
        console.log(`Uploaded File URL: ${fileUrl}`);

        let extractedText = "";

        if (fileUrl.endsWith(".pdf")) {
            console.log("Processing PDF file...");

            const tempPdfPath = path.join(tempDir, "uploaded.pdf");
            await downloadFile(fileUrl, tempPdfPath);

            const images = await convertPdfToImages(tempPdfPath);

            for (const imgPath of images) {
                console.log(`Processing image: ${imgPath}`);
                const { data: { text } } = await tesseract.recognize(imgPath, "eng");
                extractedText += text + "\n\n";

                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            }

            if (fs.existsSync(tempPdfPath)) {
                fs.unlinkSync(tempPdfPath);
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
        console.error(`OCR Processing Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export { uploadAndOcr };
