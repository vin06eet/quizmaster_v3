import puppeteer from "puppeteer";

const generatePDF = async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const htmlContent = res.htmlText;
        await page.setContent(htmlContent); 
        const pdfPath = "/Users/vineetnayak/Desktop/Report.pdf";
        await page.pdf({
            path: pdfPath,
            format: "A4",
            printBackground: true
        });

        await browser.close();

        console.log(`PDF generated and saved as "${pdfPath}"`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
};

export default generatePDF;
