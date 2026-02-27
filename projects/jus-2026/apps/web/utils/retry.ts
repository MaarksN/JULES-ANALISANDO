interface RetryConfig {
    retries?: number;
    backoff?: number;
}

export const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    config: RetryConfig = {}
): Promise<Response> => {
    const { retries = 3, backoff = 1000 } = config;
    let attempt = 0;

    while (attempt < retries) {
        try {
            const response = await fetch(url, options);

            // Retry on Server Errors (5xx) or Rate Limits (429)
            if (response.status === 429 || response.status >= 500) {
                throw new Error(`Status ${response.status}`);
            }

            return response;
        } catch (error) {
            attempt++;
            if (attempt >= retries) throw error;

            const delay = backoff * Math.pow(2, attempt - 1); // Exponential Backoff
            console.warn(`Retry ${attempt}/${retries} failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error("Max retries reached");
};
