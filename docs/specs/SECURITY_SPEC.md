# Security Specification — DASS Upload Service

## 1. Path Traversal

O cliente nunca informa `filePath`. O backend constrói caminhos a partir de:

- raiz `UPLOAD_FOLDER`;
- `Application.folderName` validado e persistido;
- nome final gerado pelo backend (`{correlationId}.webp`).

`folderName` deve casar `^[a-z0-9_-]{3,100}$`. O storage resolve caminhos com `path.resolve` e rejeita destinos fora de `UPLOAD_FOLDER`.

## 2. Autorização por Aplicação

Uploads só são aceitos quando `application` aponta para uma linha existente em `core.applications` com `is_active=true`. Aplicações desconhecidas ou desativadas retornam `403`.

## 3. CRUD Administrativo

O CRUD `/api/v1/applications` não possui autenticação interna nesta versão. Ele deve ser exposto apenas em rede privada ou protegido por proxy externo. Esta decisão deve ser revista antes de qualquer exposição pública.

## 4. Upload Limits

`multer` aplica:

- `MAX_FILE_SIZE` em MB;
- `ALLOWED_FILE_TYPES` por extensão/mime.

Uploads inválidos devem falhar antes de entrar na fila.

## 5. Processamento de Imagens

Sharp roda no worker BullMQ, fora do caminho síncrono da requisição HTTP. Isso reduz bloqueio de event loop e concentra CPU em jobs assíncronos.

## 6. Segredos

Arquivos `.env`, tokens, senhas e certificados não devem ser commitados. `.env.example` deve conter apenas placeholders ou valores locais não sensíveis.
