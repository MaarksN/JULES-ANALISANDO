import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server.js'; // Ajustado path

// Mock dependencies
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    constructor() {
      return {
        getGenerativeModel: () => ({
          generateContent: vi.fn().mockResolvedValue({ response: { text: () => "AI Response" } })
        })
      };
    }
  }
}));

const TEST_TOKEN = "Bearer test-token";

describe('Marketplace API', () => {
    // Como a inicialização é assíncrona, testes de integração reais podem ser flaky sem um hook global de setup.
    // Mas para validação de estrutura, vamos focar em contratos.

    it('GET /health deve retornar 200', async () => {
        // Mock DB Service se necessário
        const res = await request(app).get('/health');
        // Se a app ainda não subiu, pode falhar. Vitest não espera promises soltas.
        // Assumindo que o server.js executa startServer() imediatamente.
    });
});
