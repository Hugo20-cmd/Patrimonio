const PDFParser = require("pdf2json");
const fs = require("fs");

const pdfParser = new PDFParser(null, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log("Extracted text length:", pdfParser.getRawTextContent().length);
    console.log("Extracted text prefix:", pdfParser.getRawTextContent().substring(0, 100));
});

// Create a dummy PDF file correctly to test
// Actually we can't easily create a valid PDF, we'll just download a sample one or rely on the previous run.
