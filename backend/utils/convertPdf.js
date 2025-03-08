import path from "path";
import fs from "fs"; // Missing import
import { exec } from "child_process";

const convertPdfToImages = async (pdfPath) => {
    return new Promise((resolve, reject) => {
        const outputFolder = path.dirname(pdfPath);
        const outputFilePrefix = path.join(outputFolder, "page");

        const command = `pdftoppm -png ${pdfPath} ${outputFilePrefix}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing pdftoppm: ${stderr}`);
                return reject(new Error("Failed to convert PDF to images"));
            }

            // Collect generated images
            const imageFiles = fs.readdirSync(outputFolder)
                .filter(file => file.startsWith("page") && file.endsWith(".png"))
                .map(file => path.join(outputFolder, file));

            if (imageFiles.length === 0) {
                return reject(new Error("No images were generated from the PDF"));
            }

            resolve(imageFiles);
        });
    });
};

export { convertPdfToImages };
