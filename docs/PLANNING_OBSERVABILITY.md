# Planejamento de Observabilidade e Logging (Upload Service)

**Status:** PLANEJADO (Aguardando Comando do Usuário)

## Objetivo
Implementar o contrato de logging e observabilidade definido na skill global da DASS (`dass-logging`). A infraestrutura será padronizada com **OpenTelemetry**, **Loki** (armazenamento de logs), **Prometheus** (métricas) e **Grafana** (visualização).

## Etapas Planejadas

1. **Instalação de Dependências:**
   - Pacotes do OpenTelemetry (SDK, Node, API, Tracer, Metrics).
   - Bibliotecas exportadoras (`otlp-http` ou nativas para os coletores).

2. **Configuração Global (Bootstrap):**
   - Criar `src/infrastructure/observability/telemetry.ts`.
   - Inicializar o rastreamento antes do TypeORM e do Express para coletar métricas da camada de infraestrutura.

3. **Padronização do Logger:**
   - Criar um `LoggerProvider` estruturado em JSON.
   - Campos obrigatórios segundo a Skill: `correlationId`, `applicationId`, `level`, `timestamp`.

4. **Injeção do Logger:**
   - Refatorar `ProcessUploadUseCase`, `CleanupExpiredDocumentsUseCase`, `BullMQWorker` e rotas para utilizarem o LoggerProvider em vez de `console.log`.

5. **Métricas Customizadas:**
   - `uploads_received_total`
   - `uploads_processed_total`
   - `expired_documents_deleted_total`

Nenhuma alteração de código deve ser feita antes de o usuário dar o aval para o início desta fase.
