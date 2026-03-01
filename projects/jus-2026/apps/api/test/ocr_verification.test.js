import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { extractTextFromPDF } from '../src/ocr.js';

describe('OCR Verification', () => {
    it('should extract text from a valid PDF', async () => {
        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create();

        // Embed the Times Roman font
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // Add a blank page to the document
        const page = pdfDoc.addPage();

        // Get the width and height of the page
        const { width, height } = page.getSize();

        // Draw a string of text toward the top of the page
        const fontSize = 30;
        const text = 'Hello World from PDF-Lib!';
        page.drawText(text, {
            x: 50,
            y: height - 4 * fontSize,
            size: fontSize,
            font: timesRomanFont,
        });

        // Serialize the PDFDocument to bytes (a Uint8Array)
        // Disable object streams to be more compatible with older parsers like pdf-parse
        const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

        // Convert Uint8Array to Buffer, as extractTextFromPDF expects Buffer or string
        const pdfBuffer = Buffer.from(pdfBytes);

        // Extract text
        const extractedText = await extractTextFromPDF(pdfBuffer);

        // Verify result
        expect(extractedText).toBeDefined();
        // pdf-parse usually adds newlines, so we check if it contains the text
        expect(extractedText).toContain('Hello World from PDF-Lib!');
    });
});
