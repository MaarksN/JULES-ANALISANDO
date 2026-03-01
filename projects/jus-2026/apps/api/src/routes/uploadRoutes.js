import express from 'express';
import multer from 'multer';
import { queue } from '../queue.js';
import { db } from '../db.js';
import { validatePayload } from '../middleware/payloadValidator.js';
import { uploadSchema } from '../schemas/uploadSchema.js';
import { AuthError, ValidationError } from '../errors/AppError.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    }
});

router.post('/', upload.single('file'), validatePayload(uploadSchema), async (req, res, next) => {
    try {
        if (!req.user) throw new AuthError();

        if (!req.file) {
            throw new ValidationError('Nenhum arquivo foi enviado.');
        }

        const documentId = db.collection('documents').doc().id;
        const jobData = {
            fileBuffer: req.file.buffer,
            fileType: req.file.mimetype,
            originalName: req.file.originalname,
            user: req.user,
            documentId,
            documentType: req.safeBody.documentType,
            sessionId: req.safeBody.sessionId
        };

        queue.add('process-document', jobData);

        res.status(202).json({
            status: 'processing',
            message: 'Documento enviado para processamento.',
            documentId,
            filename: req.file.originalname
        });

    } catch (error) {
        next(error);
    }
});

export default router;
