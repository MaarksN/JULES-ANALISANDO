const truncate = (str, length = 100) => {
    if (typeof str !== 'string' || str.length <= length) {
        return str;
    }
    return str.substring(0, length) + '...[TRUNCATED]';
};

export const sanitizeAndTruncate = (body) => {
    if (!body) {
        return null;
    }

    const newBody = JSON.parse(JSON.stringify(body));

    const fieldsToOmit = ['password', 'token', 'apiKey', 'clientSecret'];
    const fieldsToTruncate = ['text', 'content', 'file', 'data'];

    for (const key in newBody) {
        if (fieldsToOmit.includes(key.toLowerCase())) {
            newBody[key] = '[REDACTED]';
        } else if (fieldsToTruncate.includes(key.toLowerCase())) {
            newBody[key] = truncate(newBody[key], 250);
        } else if (typeof newBody[key] === 'string') {
            newBody[key] = truncate(newBody[key], 1000);
        }
    }

    return newBody;
};
