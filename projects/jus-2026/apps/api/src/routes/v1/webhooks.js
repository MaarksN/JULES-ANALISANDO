import express from 'express';
import { verifySignature } from '../../middleware/requestSigning.js';
import { idempotency } from '../../middleware/idempotency.js';

const router = express.Router();

router.post('/:source', (req, res, next) => {
    req.routeRequiresSignature = true;
    next();
}, verifySignature, idempotency, (req, res) => {
    res.status(202).json({
        received: true,
        source: req.params.source,
        requestId: req.requestId
    });
});

export default router;
