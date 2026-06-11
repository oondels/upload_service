# Database Specification — DASS Upload Service

---

## 1. Banco de Dados Principal
- **Motor:** PostgreSQL (Integrado ao ecossistema DASS via Docker)

---

## 2. Diagrama de Tabelas Core

### 2.1 Tabela `applications`

O Gateway seguro de quem opera discos dentro do servidor. Esta tabela deve ser provisionada (seeds/admin panel) para autorizar aplicativos legítimos da DASS a postarem fotos.

```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    folder_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **Índices sugeridos:** 
  - `idx_applications_folder_name` (Para otimizar a checagem rápida no momento que o multipart/form-data for interceptado em tempo de request).

### 2.2 Tabela `uploaded_documents`

A tabela auditável de mídias que espelha os arquivos transitando nas pastas lógicas da VPS.

```sql
CREATE TABLE uploaded_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL UNIQUE,
    application_id UUID NOT NULL REFERENCES applications(id),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    retention_days INTEGER, -- Sem valor = eterno
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL, -- Enum de status da máquina
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Estratégias Críticas de Indexação

Para que a API mantenha uma performance impecável, recomendamos:
1. **Índice Composto para Higienização (Cron Job):**
   `CREATE INDEX idx_docs_cron_cleanup ON uploaded_documents(status, expires_at);`
   Garante escaneamentos indexados super rápidos nas madrugadas ao isolar `SAVED` cruzando datas `< NOW()`.
   
2. **Índice O(1) de Correlação (Poller):**
   `CREATE INDEX idx_docs_correlation ON uploaded_documents(correlation_id);`
   Permite que outras APIs questionem via HTTP o término do processo no endpoint de status com custo mínimo pro banco.
