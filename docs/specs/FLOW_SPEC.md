# Flow Specification — DASS Upload Service

## 1. CRUD de Aplicações

Objetivo: manter o cadastro de aplicações autorizadas em `core.applications`.

Fluxo:
1. Cliente administrativo chama `/api/v1/applications`.
2. A rota valida payload básico e delega aos use cases de aplicação.
3. Use cases validam `name`, `folderName`, unicidade e soft delete.
4. Repositório TypeORM persiste em `core.applications`.

Observação de segurança: o CRUD não possui autenticação interna nesta versão; deve ficar atrás de rede privada ou proxy externo.

## 2. Upload Assíncrono

### Etapa 1 — Recepção HTTP (`QUEUED`)

- Endpoint principal: `POST /api/v1/uploads`.
- `multer` grava arquivo em `tmp/`, respeitando `MAX_FILE_SIZE` e `ALLOWED_FILE_TYPES`.
- `ProcessUploadUseCase` verifica `application` em `core.applications.folder_name` com `isActive=true`.
- O documento é criado em `uploads.uploaded_documents` com `status=QUEUED`, `correlationId`, `fileName={correlationId}.webp` e `expiresAt` calculado quando `persistence` existe.
- Um job é publicado na fila BullMQ `document_uploads`.
- A API retorna `202 Accepted`.

### Etapa 2 — Compressão (`COMPACTING`)

- `BullMQWorker` consome `document_uploads`.
- Busca documento e aplicação no banco.
- Atualiza status para `COMPACTING`.
- Usa Sharp para aplicar `rotate()`, resize `fit=inside` sem upscale e conversão WebP.
- Parâmetros principais vêm de env: `IMAGE_WEBP_QUALITY`, `IMAGE_MAX_WIDTH`, `IMAGE_MAX_HEIGHT`.

### Etapa 3 — Escrita Definitiva (`SAVED`)

- Storage grava buffer WebP em `UPLOAD_FOLDER/{application.folderName}/{correlationId}.webp`.
- Storage valida que o caminho final permanece dentro de `UPLOAD_FOLDER`.
- Banco atualiza `filePath`, `fileUrl`, `mimeType=image/webp` e `status=SAVED`.
- Arquivo temporário é removido.

### Falhas

- Se o worker falha após encontrar o documento, marca `FAILED`.
- O temporário é removido quando possível.
- Falhas de aplicação inexistente ou documento ausente abortam o job.

## 3. Retenção e Limpeza

- `CronJobService` roda diariamente às `02:00`.
- Busca documentos `SAVED` com `expiresAt < now()`.
- Remove arquivo físico via storage.
- Atualiza status para `EXPIRED_DELETED`.
- O registro histórico permanece no PostgreSQL.
