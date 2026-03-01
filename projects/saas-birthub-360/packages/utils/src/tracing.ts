import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { logger } from './logger';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

export const startTracing = () => {
  sdk.start()
    .then(() => logger.info('OpenTelemetry initialized'))
    .catch((error) => logger.error('Error initializing OpenTelemetry', error));

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => logger.info('OpenTelemetry terminated'))
      .catch((error) => logger.error('Error terminating OpenTelemetry', error))
      .finally(() => process.exit(0));
  });
};
