import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import vars from "../../config/env"
import { logger } from '../../utils/logger';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'uploadService',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new OTLPTraceExporter({ url: vars.OTL_TRACE_EXPORTER_URL }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: vars.OTL_METRICS_EXPORTER_URL }),
    exportIntervalMillis: 5000, // Exporta a cada 5 segundos (o padrão é 60s)
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
  ],
});

sdk.start();

logger.info('OpenTelemetry inicializado com sucesso.');

// desligamento gracioso
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => logger.info('OTel finalizado'))
    .finally(() => process.exit(0));
});