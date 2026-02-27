// utils/monitoring.ts

// Item 54: Monitoramento de Alucinação Crítica (Levenshtein Distance)
export const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment along the first row of each column
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

export const calculateChangePercentage = (original: string, modified: string): number => {
    if (!original || original.length === 0) return 0;
    const distance = levenshteinDistance(original, modified);
    const maxLength = Math.max(original.length, modified.length);
    return (distance / maxLength) * 100;
};

export const checkCriticalHallucination = (original: string, modified: string) => {
    const changePercent = calculateChangePercentage(original, modified);

    // Se mudou mais de 80%, a IA provavelmente alucinou ou foi inútil
    if (changePercent > 80) {
        console.error(`[MONITORING] ALERTA DE ALUCINAÇÃO CRÍTICA: O usuário reescreveu ${changePercent.toFixed(1)}% do texto gerado.`);
        // Em produção: enviar para Sentry ou Analytics
        return true;
    }
    return false;
};
