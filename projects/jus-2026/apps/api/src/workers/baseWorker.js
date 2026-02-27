// apps/api/src/workers/baseWorker.js

/**
 * Item 2: Classe Base para Workers (Robustez & Retry)
 * Funcionalidades:
 * 1. Padronização de logs de worker.
 * 2. Injeção de contexto de Tenant.
 * 3. Timeout automático.
 * 4. Error reporting.
 */

export class BaseWorker {
    constructor(queueName) {
        this.queueName = queueName;
        this.timeout = 30000; // 30s padrão
    }

    /**
     * Método abstrato a ser implementado pelos workers concretos.
     * @param {Object} job - { id, data, tenantId }
     */
    async process(job) {
        throw new Error("Worker deve implementar o método process(job)");
    }

    /**
     * Executa o worker com segurança (timeout + try/catch).
     */
    async run(job) {
        const start = Date.now();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout no worker ${this.queueName} (${this.timeout}ms)`)), this.timeout)
        );

        try {
            this.log(job, 'Iniciando processamento...');

            // Corrida entre timeout e execução real
            const result = await Promise.race([
                this.process(job),
                timeoutPromise
            ]);

            this.log(job, `Concluído em ${Date.now() - start}ms`);
            return result;

        } catch (error) {
            this.error(job, error);
            throw error; // Repassa para queueService lidar com retry
        }
    }

    log(job, message) {
        console.log(`[WORKER:${this.queueName}] [JOB:${job.id}] [TENANT:${job.tenantId || 'system'}] ${message}`);
    }

    error(job, error) {
        console.error(`[WORKER:${this.queueName}] [JOB:${job.id}] [TENANT:${job.tenantId || 'system'}] ERRO: ${error.message}`);
    }
}
