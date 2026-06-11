# API Specification — DASS Upload Service

> [!NOTE]
> Regras de negócio restritivas e detalhamento profundo de status válidos encontram-se no documento [DOMAIN_SPEC.md](DOMAIN_SPEC.md).

---

## 1. Convenções
- Formato predominante de Payload e Response: JSON.
- A recepção massiva de bytes ocorre unicamente via protocolo de transferência `multipart/form-data`.

---

## 2. Endpoints Operacionais

### 2.1 Criação/Enfileiramento de Imagens

**Endpoint:** `POST /api/v1/uploads`

O endpoint core. Modificado arquiteturalmente para descartar o perigoso `filePath` do input e priorizar restrições puras por domínio da Aplicação cadastrada.

**Body (multipart/form-data):**
| Chave (Key) | Tipo | Descrição Obrigatória |
|---|---|---|
| `file` | File Buffer | Array binário primário do artefato enviado pela rede. |
| `application` | Text/String | Nome/slug da aplicação autorizada (ex: `pense-e-aja`). Esta chave será interligada com `applications.folder_name` no Postgres. |
| `persistence` | Number (opcional) | A representação matemática de limite em Dias para expurgo (ex: 30 = limpar arquivo dia t+30). Parâmetro vazio garante guarda vitalícia do ativo. |

**Response Modelo Híbrido Assíncrono `202 Accepted`:**
```json
{
  "message": "Protocolo estabelecido. Artefato em processamento de buffer local.",
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "QUEUED"
}
```

**Possíveis Failures HTTP:**
- `400 Bad Request`: Validation de persistência que não seja integer. Ausência de blob no req.files.
- `403 Forbidden`: Parâmetro 'application' informou um token de aplicativo inexistente, inativo no SQL ou desabilitado da esteira.

---

### 2.2 Polling / Interrogação de Integridade Final (Callback Alternativo)

**Endpoint:** `GET /api/v1/uploads/{correlationId}`

Endpoint auxiliar caso arquiteturas satélite não possuam RabbitMQ/BullMQ configurados de volta pra consumir encerramentos, podendo apenas bater HTTP p/ checar.

**Response `200 OK` (Se Processado):**
```json
{
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "SAVED",
  "fileUrl": "http://dass.uploads/pense-e-aja/213-f47a.webp"
}
```

**Response `200 OK` (Ainda em Worker Sharp):**
```json
{
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "COMPACTING",
  "fileUrl": null
}
```
