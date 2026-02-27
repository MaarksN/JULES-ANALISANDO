import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/swagger.js';

// Serviços e Middlewares que podem ser importados estaticamente (não dependem do DB na raiz)
import { setupCollaboration } from './src/services/collaborationService.js';
import * as JobService from './src/jobs.js'; // Ajuste: verificar se jobs.js inicializa DB
import { loadEnterpriseSecrets } from './src/services/secretService.js';
import { initDatabase } from './src/services/dbService.js';
import { queueService } from './src/services/queueService.js';

import { authenticate } from './src/middleware/authMiddleware.js';
import { enterpriseAuditLog } from './src/middleware/enterpriseAudit.js';
import { enterpriseLimiter } from './src/middleware/rateLimiter.js';
import { securityHeaders } from './src/middleware/securityHeaders.js';
import { ipFilter } from './src/middleware/ipFilter.js';
import { globalErrorHandler } from './src/middleware/errorHandler.js';
import './src/workers/documentProcessor.js';
import './src/workers/ragIndexer.js';
import './src/workers/notificationWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const app = express();
const httpServer = createServer(app);

// Função de Inicialização Assíncrona
const startServer = async () => {
    try {
        console.log("🚀 Inicializando JusArtificial (Enterprise Core)...");

        // 1. Carregar Segredos (Crítico para Auth e DB)
        await loadEnterpriseSecrets();

        // 2. Inicializar Banco de Dados
        await initDatabase();

        // 3. Importação Dinâmica de Rotas (Evita acesso prematuro ao DB)
        // Isso garante que db.js tenha sido inicializado antes de qualquer model/service ser chamado
        const { default: v1Routes } = await import('./src/routes/v1/index.js');
        const { default: healthRoutes } = await import('./src/routes/health.js');

        // Configuração de Segurança e Middlewares
        app.use(requestContext);
        app.use(requestLogger);
        app.use(securityHeaders);
        app.use(apiVersioning({ version: 'v1' }));

        // CORS
        const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000,http://127.0.0.1:3000')
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean);
        app.use(cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
                const corsError = new Error('CORS_ORIGIN_DENIED');
                corsError.status = 403;
                return callback(corsError);
            },
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'idempotency-key', 'x-signature', 'x-signature-timestamp', 'x-signature-nonce']
        }));

        // WebSockets
        const io = new Server(httpServer, {
            cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
        });
        setupCollaboration(io);
        // JobService.startJobs(); // Se depender do DB, mover para cá

        // Body Parser e Rate Limit
        app.use(express.json({ limit: '50mb' }));
        app.use(enterpriseLimiter);

        // Rotas Públicas
        app.use('/health', healthRoutes);
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        // Rotas da API (Protegidas)
        const apiRouter = express.Router();
        apiRouter.use(authenticate); // Auth Zero Trust
        apiRouter.use(ipFilter);       // IP Whitelist
        apiRouter.use(enterpriseAuditLog); // Auditoria Imutável

        // Montar Versão V1
        apiRouter.use('/v1', v1Routes);

        // Dashboard simples de filas (protegido por auth)
        app.get('/admin/queues', authenticate, ipFilter, (req, res) => {
            res.json({ mode: queueService.mode, jobs: queueService.snapshot() });
        });

        app.get('/admin/queues/stats', authenticate, ipFilter, (req, res) => {
            const jobs = queueService.snapshot();
            const grouped = jobs.reduce((acc, job) => {
                acc[job.queueName] = acc[job.queueName] || { waiting: 0, active: 0, completed: 0, failed: 0 };
                if (acc[job.queueName][job.status] !== undefined) acc[job.queueName][job.status] += 1;
                return acc;
            }, {});
            res.json({ mode: queueService.mode, totals: grouped });
        });

        app.get('/admin/queues/health', enterpriseAuth, ipFilter, (req, res) => {
            res.json(queueService.health());
        });

        // Montar base /api
        app.use('/api', apiRouter);

        // Error Handler Centralizado (Deve ser o último)
        app.use(globalErrorHandler);

        // Servir Frontend Estático (Produção Monolítica)
        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(path.join(__dirname, '../web/dist'))); // Ajustado para apps/web/dist se buildado lá
            app.get('*', (req, res) => {
                if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not Found' });
                res.sendFile(path.join(__dirname, '../web/dist', 'index.html'));
            });
        }

        const port = process.env.PORT || 3001;

        if (process.env.NODE_ENV !== 'test') {
            httpServer.listen(port, () => {
                console.log(`🚀 Servidor rodando na porta ${port}`);
                console.log(`🛡️  Segurança: Zero Trust | Tenant Isolation: Ativo`);
            });
        }

    } catch (err) {
        console.error("❌ Erro Crítico na Inicialização:", err);
        process.exit(1);
    }
};

// Iniciar
export const serverReady = startServer();
