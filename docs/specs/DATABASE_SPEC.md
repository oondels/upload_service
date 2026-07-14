# Database Specification — DASS Upload Service

## 1. Banco

- Motor: PostgreSQL.
- ORM: TypeORM.
- `synchronize=false`; mudanças estruturais devem passar por migrations.

## 2. Schemas

### `core.applications`

```sql
CREATE TABLE core.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  folder_name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Uso:
- Autoriza aplicações que podem enviar uploads.
- `folder_name` é usado como chave HTTP e pasta física.
- Soft delete é representado por `is_active=false`.

Índice:
- `idx_applications_folder_name` em `folder_name`.

### `uploads.uploaded_documents`

```sql
CREATE TABLE uploads.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  correlation_id UUID NOT NULL UNIQUE,
  application_id UUID NOT NULL REFERENCES core.applications(id),
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  retention_days INTEGER,
  expires_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Índices:
- `idx_docs_cron_cleanup(status, expires_at)` para expurgo.
- `idx_docs_correlation(correlation_id)` para polling.

## 3. Migration Policy

- Não usar `synchronize=true`.
- Não dropar tabelas em migrations de evolução sem aprovação explícita.
- Migrations devem ser idempotentes quando corrigirem ambientes parcialmente provisionados.
