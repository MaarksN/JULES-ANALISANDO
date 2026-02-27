import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import paymentRoutes from '../src/routes/paymentRoutes.js';
import * as PaymentService from '../src/payment.js';

// Mock PaymentService
vi.mock('../src/payment.js', () => ({
    createCheckoutSession: vi.fn().mockResolvedValue({ id: 'sess_123', url: 'http://stripe.com' })
}));

const app = express();
app.use(express.json());

// Mock Auth Middleware
app.use((req, res, next) => {
    req.user = { uid: 'user_123' };
    next();
});

app.use('/payment', paymentRoutes);

describe('Payment Routes', () => {
    it('POST /checkout calls createCheckoutSession with correct arguments', async () => {
        const res = await request(app)
            .post('/payment/checkout')
            .send({ priceId: 'price_abc' });

        expect(res.status).toBe(200);
        // This is the assertion that will fail before the fix
        expect(PaymentService.createCheckoutSession).toHaveBeenCalledWith('price_abc', 'user_123');
    });
});
