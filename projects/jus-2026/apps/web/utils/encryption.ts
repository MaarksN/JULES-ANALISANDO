// utils/encryption.ts

// AES-GCM Implementation using Web Crypto API

// Item "Zero-Knowledge": Derive Key from Password (PBKDF2)
export const deriveKeyFromPassword = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false, // Key is non-extractable (Memory Only)
        ["encrypt", "decrypt"]
    );
};

// Generate random salt
export const generateSalt = (): Uint8Array => {
    return window.crypto.getRandomValues(new Uint8Array(16));
};

// Generate Random Key (Fallback)
export const generateKey = async (): Promise<CryptoKey> => {
    return window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
};

// Export Key
export const exportKey = async (key: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    return JSON.stringify(exported);
};

// Convert Salt/IV to string for storage
export const bufferToString = (buffer: Uint8Array): string => {
    return btoa(String.fromCharCode(...buffer));
};

export const stringToBuffer = (str: string): Uint8Array => {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
};

// Encrypt Text
export const encryptData = async (text: string, key: CryptoKey): Promise<{ cipherText: string, iv: string }> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
    );

    return {
        cipherText: bufferToString(new Uint8Array(encryptedBuffer)),
        iv: bufferToString(iv)
    };
};

// Decrypt Text
export const decryptData = async (cipherText: string, ivStr: string, key: CryptoKey): Promise<string> => {
    const decoder = new TextDecoder();

    const encryptedData = stringToBuffer(cipherText);
    const iv = stringToBuffer(ivStr);

    try {
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            encryptedData
        );
        return decoder.decode(decryptedBuffer);
    } catch (e) {
        console.error("Decryption failed. Wrong password?", e);
        throw new Error("Falha na descriptografia. Senha incorreta.");
    }
};
