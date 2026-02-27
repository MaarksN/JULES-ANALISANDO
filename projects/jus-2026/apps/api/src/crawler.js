export const searchJurisprudence = async (query) => {
    // Mock Search Logic imitating Jusbrasil/STJ results
    console.log(`Searching jurisprudence for: ${query}`);

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockResults = [
        {
            id: 'tj-1',
            tribunal: 'TJSP',
            data: new Date().toLocaleDateString('pt-BR'),
            relator: 'Des. Antonio Carlos',
            ementa: `APELAÇÃO CÍVEL. AÇÃO DE INDENIZAÇÃO. ${query.toUpperCase()}. DANO MORAL CONFIGURADO. QUANTUM MANTIDO. RECURSO NÃO PROVIDO.`,
            inteiroTeor: 'Relatório... Voto... Acordam...',
            tipo: 'Favorável'
        },
        {
            id: 'stj-1',
            tribunal: 'STJ',
            data: '15/03/2024',
            relator: 'Min. Nancy Andrighi',
            ementa: `RECURSO ESPECIAL. DIREITO DO CONSUMIDOR. ${query.toUpperCase()}. TEMA REPETITIVO 999. OBRIGAÇÃO DE FAZER.`,
            inteiroTeor: 'A controvérsia gira em torno de...',
            tipo: 'Favorável'
        },
        {
            id: 'tjrj-1',
            tribunal: 'TJRJ',
            data: '10/02/2024',
            relator: 'Des. Maria Helena',
            ementa: `AGRAVO DE INSTRUMENTO. TUTELA ANTECIPADA. ${query.toUpperCase()}. AUSÊNCIA DOS REQUISITOS DO ART. 300 DO CPC.`,
            inteiroTeor: 'Indefiro o pedido de efeito suspensivo...',
            tipo: 'Desfavorável'
        }
    ];

    return mockResults;
};
