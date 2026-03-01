import pino, { Logger } from "pino";
import { AsyncLocalStorage } from "node:async_hooks";

const correlationStore = new AsyncLocalStorage<{ correlationId?: string }>();

export function withCorrelationId<T>(correlationId: string, fn: () => T): T {
  return correlationStore.run({ correlationId }, fn);
}

export function createLogger(context: string): Logger {
  const isProd = process.env.NODE_ENV === "production";
  const base = {
    context,
  };

  const logger = pino({
    base,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    mixin() {
      const store = correlationStore.getStore();
      return { correlationId: store?.correlationId || null };
    },
    transport: isProd
      ? undefined
      : {
          target: "pino-pretty",
          options: { colorize: true, translateTime: true, ignore: "pid,hostname" },
        },
  });

  return logger;
}
