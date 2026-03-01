export const anonymizePII = (text) => {
    if (!text) return "";
    let clean = text;
    // CPF
    clean = clean.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF]');
    // Email
    clean = clean.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    return clean;
};
