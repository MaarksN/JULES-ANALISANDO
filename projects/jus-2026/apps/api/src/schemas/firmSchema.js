import { z } from 'zod';

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const firmSchema = z.object({
    name: z.string().min(2).max(160),
    cnpj: z.string().regex(cnpjRegex, 'CNPJ inválido. Use o formato 00.000.000/0000-00.')
});
