import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const createCheckoutSession = async (priceId, userId) => {
    if (stripe) {
        try {
            console.log(`[STRIPE] Iniciando checkout para usuário ${userId}...`);
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'], // 'pix' requires BRL currency and specific setup, simplified to card for generic key compatibility
                line_items: [{ price: priceId, quantity: 1 }],
                mode: 'subscription',
                success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
                cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancel`,
                client_reference_id: userId,
                metadata: { userId }
            });
            return { id: session.id, url: session.url };
        } catch (e) {
            console.error("Stripe Error:", e);
            throw new Error("Falha na criação do checkout real.");
        }
    } else {
        // Fallback or Error if strict mode
        console.warn("Stripe key missing. Using Mock.");
        return {
            id: `cs_test_${Math.random().toString(36).substring(7)}`,
            url: `https://checkout.stripe.com/pay/cs_test_mock?price=${priceId}&client_reference_id=${userId}`
        };
    }
};

export const handleWebhook = async (body, signature) => {
    if (!stripe) return { received: true };

    try {
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        // Handle event type...
        return event;
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        throw err;
    }
};
