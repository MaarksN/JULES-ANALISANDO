import { describe, it, expect } from 'vitest';
import { isValidOAB, anonymizeLGPD, validateLegalCitations } from './helpers';

describe('JusArtificial Helpers', () => {

    it('should validate OAB format correctly', () => {
        expect(isValidOAB('123456/SP')).toBe(true);
        expect(isValidOAB('123456')).toBe(true);
        expect(isValidOAB('ABC/SP')).toBe(false);
    });

    it('should anonymize sensitive data (LGPD)', () => {
        const text = "O cliente CPF 123.456.789-00 enviou email para teste@email.com";
        const result = anonymizeLGPD(text);
        expect(result).toContain("***.***.***-**");
        expect(result).toContain("[EMAIL PROTEGIDO]");
        expect(result).not.toContain("123.456.789-00");
    });

    it('should detect missing legal citations', () => {
        const weakText = "Eu acho que o réu deve pagar porque foi injusto. É totalmente errado o que fizeram."; // > 50 chars
        const strongText = "Conforme Art. 186 do Código Civil e Lei 8.078, há dever de indenizar.";

        expect(validateLegalCitations(weakText).isValid).toBe(false);
        expect(validateLegalCitations(strongText).isValid).toBe(true);
    });
});
