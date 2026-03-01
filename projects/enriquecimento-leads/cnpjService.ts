export interface CNPJApiResponse {
  razao_social: string;
  cnpj: string;
  situacao_cadastral: string;
  cnae_fiscal_principal_code?: string;
  cnae_fiscal_principal?: string;
}

const BRASIL_API_BASE_URL = 'https://brasilapi.com.br/api/cnpj/v1';

export const sanitizeCNPJ = (value: string): string => value.replace(/\D/g, '');

export const isValidCNPJLength = (value: string): boolean => sanitizeCNPJ(value).length === 14;

export const fetchCNPJData = async (cnpj: string): Promise<CNPJApiResponse> => {
  const sanitized = sanitizeCNPJ(cnpj);

  if (!isValidCNPJLength(sanitized)) {
    throw new Error('CNPJ deve conter 14 dígitos.');
  }

  const response = await fetch(`${BRASIL_API_BASE_URL}/${sanitized}`);

  if (!response.ok) {
    if (response.status === 404 || response.status === 400) {
      throw new Error('CNPJ inválido ou não encontrado na base consultada.');
    }
    throw new Error('Falha na consulta de CNPJ. Tente novamente em instantes.');
  }

  return response.json();
};
