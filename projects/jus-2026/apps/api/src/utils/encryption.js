import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Master key should be in env. For dev, we use a fixed fallback or fail.
const MASTER_KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32);

if (!process.env.ENCRYPTION_KEY) {
    console.warn("WARNING: ENCRYPTION_KEY not set. Using random key (Data will be lost on restart).");
}

export const encrypt = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export const decrypt = (encryptedText) => {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        MASTER_KEY,
        Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};
