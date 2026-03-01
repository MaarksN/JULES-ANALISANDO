import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import { db } from './db.js';
import { encrypt } from './utils/encryption.js';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const standardFontsDir = path.join(pdfjsDistPath, 'standard_fonts/');

export const extractTextFromPDF = async (input) => {
    try {
        let buffer;
        if (Buffer.isBuffer(input)) {
            buffer = input;
        } else if (typeof input === 'string') {
            buffer = Buffer.from(input, 'base64');
        } else {
            throw new Error("Invalid input type for PDF extraction");
        }

        // Convert Buffer to Uint8Array for pdfjs-dist
        const uint8Array = new Uint8Array(buffer);

        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            standardFontDataUrl: standardFontsDir
        });
        const doc = await loadingTask.promise;
        const numPages = doc.numPages;
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
            const page = await doc.getPage(i);
            const textContent = await page.getTextContent();
            // Join items with space, but preserve layout somewhat better if needed.
            // For now, simple space joining is standard replacement for pdf-parse basic usage.
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        if (!fullText || fullText.trim().length < 10) {
             throw new Error("Texto insuficiente no PDF");
        }
        return fullText;
    } catch (e) {
        console.error("PDF Parse Error:", e);
        return null;
    }
};

export const extractTextOCR = async (buffer) => {
    console.log("[OCR Pipeline] Iniciando Tesseract...");
    try {
        const { data: { text } } = await Tesseract.recognize(buffer, 'por', {});
        return text;
    } catch (e) {
        console.error("[OCR Pipeline] Falha:", e);
        return null;
    }
};

export const processUpload = async (file, user, documentId = null) => {
    if (!file) throw new Error("Nenhum arquivo enviado.");

    let text = "";
    const isPDF = file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');
    const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (isPDF) {
        text = await extractTextFromPDF(file.buffer);
    } else if (isImage) {
        text = await extractTextOCR(file.buffer);
    } else if (isDocx) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
    } else {
        throw new Error("Formato não suportado. Use PDF, Imagem ou DOCX.");
    }

    // Encrypt before save to ensure "Absolute Legal Secrecy" at rest
    const storedText = encrypt(text);

    // Persistence
    let finalDocId = documentId;
    try {
        const docData = {
            filename: file.originalname || file.originalName,
            text: storedText || "", // ENCRYPTED
            mimeType: file.mimetype || file.fileType,
            createdAt: new Date().toISOString(),
            status: 'processed'
        };

        if (user) {
            docData.userId = user.uid;
            docData.firmId = user.firmId;
        }

        if (documentId) {
            await db.collection('documents').doc(documentId).set(docData, { merge: true });
        } else {
            const docRef = await db.collection('documents').add(docData);
            finalDocId = docRef.id;
        }
    } catch(e) {
        console.warn("Failed to persist extracted document", e);
    }

    return {
        text: text, // Return raw text for immediate processing in Worker
        fallbackToVision: text === null,
        filename: file.originalname,
        documentId: finalDocId
    };
};
