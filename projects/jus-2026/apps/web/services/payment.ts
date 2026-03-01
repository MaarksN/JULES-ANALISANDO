import { fetchWithRetry } from '../utils/retry';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const createCheckoutSession = async (priceId: string) => {
    try {
        const res = await fetchWithRetry(`${API_URL}/api/payment/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId })
        });
        if (!res.ok) throw new Error("Falha no pagamento");
        return await res.json();
    } catch (error) {
        console.error("Payment Error:", error);
        throw error;
    }
};
