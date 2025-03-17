import puppeteer from "puppeteer";

const generatePDF = async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Check if htmlText is provided in the request body
        const htmlContent = req.body.htmlText;
        if (!htmlContent) {
            return res.status(400).send("No HTML content provided");
        }

        await page.setContent(htmlContent, { waitUntil: "load" });

        // Generate PDF buffer
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true
        });

        await browser.close();

        // Set correct headers
        res.setHeader("Content-Disposition", "attachment; filename=Report.pdf");
        res.setHeader("Content-Type", "application/pdf");

        // Send the PDF buffer as response
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Failed to generate PDF");
    }
};

export default generatePDF;
