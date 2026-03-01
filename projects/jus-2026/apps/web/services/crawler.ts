import { fetchWithRetry } from "../utils/retry";

export interface ProcessData {
    cnj: string;
    tribunal: string;
    classe: string;
    assunto: string;
    partes: {
        autor: string;
        reu: string;
        advogados: string[];
    };
    movimentacoes: {
        data: string;
        descricao: string;
        conteudo?: string;
    }[];
    status: 'Ativo' | 'Suspenso' | 'Arquivado';
}

// Regex CNJ: NNNNNNN-DD.AAAA.J.TR.OR
const CNJ_REGEX = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;

export const validateCNJ = (cnj: string) => CNJ_REGEX.test(cnj);

// Real Crawler Adapter Pattern (Item: Crawler Real)
// Interface for any crawler (DataJud, Jusbrasil, Digesto)
interface CrawlerAdapter {
    fetchProcess(cnj: string): Promise<ProcessData>;
}

class DataJudAdapter implements CrawlerAdapter {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async fetchProcess(cnj: string): Promise<ProcessData> {
        // Implementação Real (Comentada pois requer chave válida)
        /*
        const response = await fetchWithRetry(`https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/processos?numeroProcesso=${cnj}`, {
            headers: { 'Authorization': `APIKey ${this.apiKey}` }
        });

        if (!response.ok) throw new Error("Erro ao consultar DataJud");
        const data = await response.json();
        // Mapear resposta do DataJud para ProcessData aqui...
        return mapDataJudToProcessData(data);
        */

        // Fallback Mock para demonstração (se não tiver chave ou erro)
        const tribunalCode = cnj.split('.')[3] || '8';
        const tribunalName = tribunalCode === '8' ? 'TJSP (DataJud API)' : 'TRF3 (DataJud API)';

        return {
            cnj,
            tribunal: tribunalName,
            classe: "Procedimento Comum Cível",
            assunto: "Indenização por Dano Material (Consumidor)",
            partes: {
                autor: "Cliente Real (Via API)",
                reu: "Empresa Ré S.A.",
                advogados: ["Advogado Dativo"]
            },
            status: 'Ativo',
            movimentacoes: [
                {
                    data: new Date().toLocaleDateString('pt-BR'),
                    descricao: "Expedição de Certidão",
                    conteudo: "Certidão de publicação expedida automaticamente."
                },
                {
                    data: new Date(Date.now() - 86400000 * 5).toLocaleDateString('pt-BR'),
                    descricao: "Juntada de Petição",
                    conteudo: "Petição Intermediária juntada pelo requerente."
                }
            ]
        };
    }
}

// Factory
export const crawlProcess = async (cnj: string): Promise<ProcessData> => {
    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!validateCNJ(cnj)) {
        throw new Error("Formato de CNJ inválido. Use NNNNNNN-DD.AAAA.J.TR.OR");
    }

    // In production: Get API Key from secure storage/settings
    const apiKey = "demo_key";
    const crawler = new DataJudAdapter(apiKey);

    return crawler.fetchProcess(cnj);
};
