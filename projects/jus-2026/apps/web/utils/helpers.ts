// utils/helpers.ts

// Item 62: Validação de Segurança de Arquivos (Sanitização SVG/Executáveis)
export const validateFileSecurity = (file: File): boolean => {
    const dangerousExtensions = ['.svg', '.exe', '.sh', '.bat', '.php', '.js'];
    const dangerousMimeTypes = ['image/svg+xml', 'application/x-msdownload', 'application/x-sh', 'application/javascript'];

    if (dangerousMimeTypes.includes(file.type)) return false;

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (dangerousExtensions.includes(ext)) return false;

    return true;
};

// Item 48: Validação OAB
export const isValidOAB = (oab: string): boolean => {
    // Formato esperado: 123456/SP ou 123456
    return /^\d+(\/[A-Z]{2})?$/.test(oab);
};

// Item 47: LGPD Anonymizer
export const anonymizeLGPD = (text: string): string => {
    return text
        .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, "***.***.***-**") // CPF
        .replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, "[EMAIL PROTEGIDO]") // Email
        .replace(/(\(\d{2}\)\s?\d{4,5}-\d{4})/g, "(**) *****-****"); // Telefone
};

// Item 13: Verificador de Alucinações (Validação de Citações)
export const validateLegalCitations = (text: string): { isValid: boolean; message: string } => {
    const hasLaw = /(Lei|Decreto|Súmula|Constituição|CF\/88|CPC|CDC|Código Civil|Código Penal|CLT)\s+(n[ºo]\s*)?[\d\./-]+/i.test(text);
    const hasArt = /(Art\.|Artigo)\s+\d+/i.test(text);

    // Ajuste: Apenas considera inválido se o texto for longo E não tiver citações
    // Textos curtos podem ser apenas cumprimentos ou respostas simples
    if (text.length > 50 && !hasLaw && !hasArt) {
        return { isValid: false, message: "⚠️ Alerta: Nenhuma fundamentação legal explícita detectada." };
    }
    return { isValid: true, message: "✅ Fundamentação legal identificada." };
};

// Item 41: Integração Jusbrasil (Pesquisa Externa)
export const openJusbrasil = (query: string) => {
    if (!query) return;
    window.open(`https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(query)}`, '_blank');
};

// Item 22 & 19: Exportação DOCX com Formatação ABNT
export const exportToDocx = (content: string, fileName: string = "documento") => {
    // Conversão Markdown -> HTML Melhorada
    let formattedContent = content
        // Headers
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        // Bold/Italic
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Listas (Simples)
        .replace(/^\s*-\s+(.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\s*<ul>/g, '') // Merge adjacent lists
        // Parágrafos (Quebras duplas = novo parágrafo)
        .split(/\n\s*\n/).map(p => {
             if (p.trim().startsWith('<h') || p.trim().startsWith('<ul')) return p;
             return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
        }).join('');

    // Template HTML compatível com Word (MHTML-ish)
    // Margens ABNT: Superior/Esquerda 3cm, Inferior/Direita 2cm
    const preHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${fileName}</title>
            <!-- Configurações de Página do Word -->
            <xml>
                <w:WordDocument>
                    <w:View>Print</w:View>
                    <w:Zoom>100</w:Zoom>
                    <w:DoNotOptimizeForBrowser/>
                </w:WordDocument>
            </xml>
            <style>
                @page {
                    size: A4;
                    margin: 3cm 2cm 2cm 3cm; /* Margens ABNT: Sup 3, Dir 2, Inf 2, Esq 3 */
                    mso-page-orientation: portrait;
                }
                body {
                    font-family: 'Times New Roman', serif;
                    font-size: 12pt;
                    line-height: 1.5;
                    color: #000000;
                    tab-interval: 1.25cm;
                }
                p {
                    margin-top: 0;
                    margin-bottom: 0;
                    text-align: justify;
                    text-indent: 1.25cm; /* Recuo de primeira linha ABNT */
                }
                h1 {
                    font-size: 14pt;
                    font-weight: bold;
                    text-transform: uppercase;
                    text-align: center;
                    margin-top: 24pt;
                    margin-bottom: 12pt;
                }
                h2 {
                    font-size: 12pt;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-top: 18pt;
                    margin-bottom: 6pt;
                }
                h3 {
                    font-size: 12pt;
                    font-weight: bold;
                    margin-top: 12pt;
                    margin-bottom: 6pt;
                }
                a { color: blue; text-decoration: underline; }
                ul { margin-top: 0; margin-bottom: 0; }
                li { margin-left: 1.25cm; }

                /* Estilo para Citação (Recuo 4cm) */
                blockquote {
                    margin-left: 4cm;
                    font-size: 10pt;
                    line-height: 1.0;
                    text-align: justify;
                }
            </style>
        </head>
        <body>
            <div class="Section1">
    `;
    const postHtml = "</div></body></html>";

    const fullHtml = preHtml + formattedContent + postHtml;

    const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.doc`; // .doc abre no Word corretamente como HTML MHTML
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Item 35: Gerar ID amigável para navegação
export const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
};

// Item 35: Extrair Cabeçalhos para Sumário
export const extractHeadings = (markdown: string) => {
    const lines = markdown.split('\n');
    const headings = [];

    for (const line of lines) {
        const match = line.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
            headings.push({
                level: match[1].length, // 1, 2, or 3
                text: match[2].trim(),
                id: generateSlug(match[2].trim())
            });
        }
    }
    return headings;
};

// Item 22: Formatador ABNT Básico (Best Effort)
export const formatABNT = (text: string): string => {
    let formatted = text;
    // Autores em caixa alta dentro de parênteses: (Silva, 2020) -> (SILVA, 2020)
    formatted = formatted.replace(/\(([a-zA-ZÀ-ÿ]+),\s*(\d{4})\)/g, (match, name, year) => {
        return `(${name.toUpperCase()}, ${year})`;
    });
    // Apud em itálico
    formatted = formatted.replace(/\s(apud)\s/gi, ' *apud* ');
    // Et al em itálico
    formatted = formatted.replace(/\s(et al\.?)\s/gi, ' *et al.* ');

    return formatted;
};