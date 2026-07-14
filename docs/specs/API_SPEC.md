# API Specification — DASS Upload Service

## 1. Convenções

- API principal versionada em `/api/v1`.
- Payloads JSON, exceto upload de arquivo via `multipart/form-data`.
- `POST /upload` existe apenas como alias legado deprecated.

## 2. Aplicações Autorizadas

`core.applications` controla quais sistemas podem gravar arquivos no serviço. O CRUD não possui autenticação interna nesta versão; a proteção deve ser feita por rede privada ou proxy externo.

### `GET /api/v1/applications`

Retorna todas as aplicações cadastradas.

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Pense e Aja",
      "folderName": "pense-e-aja",
      "isActive": true,
      "createdAt": "2026-07-14T00:00:00.000Z",
      "updatedAt": "2026-07-14T00:00:00.000Z"
    }
  ]
}
```

### `GET /api/v1/applications/{id}`

Retorna uma aplicação por ID. Responde `404` quando não encontrada.

### `POST /api/v1/applications`

```json
{
  "name": "Pense e Aja",
  "folderName": "pense-e-aja",
  "isActive": true
}
```

Regras:
- `name` é obrigatório e limitado a 255 caracteres.
- `folderName` é obrigatório, único e deve casar `^[a-z0-9_-]{3,100}$`.
- `isActive` é opcional e assume `true`.

Respostas: `201`, `400` para validação, `409` para duplicidade.

### `PUT /api/v1/applications/{id}`

Atualiza `name`, `folderName` e/ou `isActive`. Ao menos um campo deve ser enviado.

Respostas: `200`, `400`, `404`, `409`.

### `DELETE /api/v1/applications/{id}`

Soft delete administrativo: marca `isActive=false` e preserva histórico. Não remove registros físicos nem documentos vinculados.

## 3. Uploads

### `POST /api/v1/uploads`

Recebe upload e enfileira processamento assíncrono.

Body `multipart/form-data`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| `file` | File | Sim | Imagem original. |
| `application` | string | Sim | `folderName` de uma aplicação ativa. |
| `persistence` | integer | Não | Dias até expiração física. Ausente significa retenção indefinida. |

Resposta `202`:

```json
{
  "message": "Upload aceito e enviado para processamento na fila.",
  "correlationId": "uuid",
  "status": "QUEUED"
}
```

Falhas principais:
- `400`: arquivo ausente, tipo inválido, tamanho excedido ou `persistence` inválido.
- `403`: aplicação inexistente ou inativa.
- `500`: falha inesperada no processamento inicial.

### `POST /upload` Deprecated

Alias temporário. Usa os campos legados `applicationFolderName` e `retentionDays`, retorna header `Deprecation: true` e aponta para `/api/v1/uploads`.

### `GET /api/v1/uploads/{correlationId}`

Consulta o status do upload.

```json
{
  "correlationId": "uuid",
  "status": "SAVED",
  "fileUrl": "http://localhost:3020/uploads/pense-e-aja/uuid.webp"
}
```

`fileUrl` é `null` enquanto o documento ainda não possui arquivo final.
