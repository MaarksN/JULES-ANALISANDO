export class AppError extends Error {
    constructor({
        code = 'internal',
        title = 'Erro interno',
        detail = 'Ocorreu um erro interno.',
        status = 500,
        meta = {}
    } = {}) {
        super(detail);
        this.name = this.constructor.name;
        this.code = code;
        this.title = title;
        this.status = status;
        this.meta = meta;
    }
}

export class AuthError extends AppError {
    constructor(detail = 'Autenticação necessária.') {
        super({ code: 'auth', title: 'Não autenticado', detail, status: 401 });
    }
}

export class ForbiddenError extends AppError {
    constructor(detail = 'Você não possui permissão para esta ação.') {
        super({ code: 'forbidden', title: 'Acesso negado', detail, status: 403 });
    }
}

export class NotFoundError extends AppError {
    constructor(detail = 'Recurso não encontrado.') {
        super({ code: 'not_found', title: 'Não encontrado', detail, status: 404 });
    }
}

export class ValidationError extends AppError {
    constructor(detail = 'Dados de entrada inválidos.', meta = {}) {
        super({ code: 'validation', title: 'Falha de validação', detail, status: 400, meta });
    }
}

export class AIQuotaError extends AppError {
    constructor(detail = 'Cota diária de IA excedida para o seu plano.') {
        super({ code: 'ai_quota', title: 'Cota excedida', detail, status: 429 });
    }
}

export class LegalValidationError extends AppError {
    constructor(detail = 'Não foi possível validar as citações jurídicas.') {
        super({ code: 'legal_validation', title: 'Falha na validação jurídica', detail, status: 502 });
    }
}
