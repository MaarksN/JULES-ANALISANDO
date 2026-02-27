// utils/diffLogic.ts

export type DiffPart = {
  type: 'eq' | 'add' | 'del';
  value: string;
};

// Implementação simplificada de diff baseada em palavras
export const computeDiff = (text1: string, text2: string): DiffPart[] => {
  if (!text1) return [{ type: 'add', value: text2 }];
  if (!text2) return [{ type: 'del', value: text1 }];

  const words1 = text1.split(/(\s+)/);
  const words2 = text2.split(/(\s+)/);

  // Algoritmo LCS (Longest Common Subsequence) simplificado para visualização
  const matrix: number[][] = Array(words1.length + 1).fill(null).map(() => Array(words2.length + 1).fill(0));

  for (let i = 0; i < words1.length; i++) {
    for (let j = 0; j < words2.length; j++) {
      if (words1[i] === words2[j]) {
        matrix[i + 1][j + 1] = matrix[i][j] + 1;
      } else {
        matrix[i + 1][j + 1] = Math.max(matrix[i + 1][j], matrix[i][j + 1]);
      }
    }
  }

  const diff: DiffPart[] = [];
  let i = words1.length;
  let j = words2.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
      diff.unshift({ type: 'eq', value: words1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      diff.unshift({ type: 'add', value: words2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      diff.unshift({ type: 'del', value: words1[i - 1] });
      i--;
    }
  }

  // Agrupar partes adjacentes do mesmo tipo para renderização limpa
  const groupedDiff: DiffPart[] = [];
  if (diff.length > 0) {
    let current = diff[0];
    for (let k = 1; k < diff.length; k++) {
      if (diff[k].type === current.type) {
        current.value += diff[k].value;
      } else {
        groupedDiff.push(current);
        current = diff[k];
      }
    }
    groupedDiff.push(current);
  }

  return groupedDiff;
};