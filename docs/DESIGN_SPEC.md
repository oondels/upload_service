# Design Specification — DASS Upload Service

Este documento é o mapa central de engenharia do projeto. Leia primeiro este arquivo e depois apenas a spec relacionada à alteração.

## Índice de Specs

| Spec | Escopo | Quando ler |
|---|---|---|
| [DOMAIN_SPEC.md](specs/DOMAIN_SPEC.md) | Entidades `Application`, `UploadedDocument`, status e invariantes | Alterações em domínio, retenção ou status |
| [FLOW_SPEC.md](specs/FLOW_SPEC.md) | Fluxos assíncronos de upload, Sharp, BullMQ e cron | Alterações em worker, fila, cron ou upload |
| [DATABASE_SPEC.md](specs/DATABASE_SPEC.md) | Schemas PostgreSQL, migrations, índices e constraints | Alterações em banco, migrations ou entidades TypeORM |
| [API_SPEC.md](specs/API_SPEC.md) | Contratos HTTP versionados | Alterações em rotas, payloads ou respostas |
| [SECURITY_SPEC.md](specs/SECURITY_SPEC.md) | Validação, path traversal, limites e superfície administrativa | Alterações em storage, autorização ou validação |

## Estrutura

```text
src/
├── domain/                  # Entidades e contratos
├── application/             # Use cases e regras de aplicação
├── infrastructure/          # TypeORM, BullMQ, storage, cron e observabilidade
├── routes/                  # Adaptadores HTTP Express
├── app.ts                   # Composition root HTTP
└── index.ts                 # Bootstrap de banco, worker, cron e servidor
```

## Regras Gerais

1. Use cases dependem apenas de contratos do domínio. Não instanciam banco, fila, filesystem ou Sharp.
2. Rotas HTTP são adaptadores finos: validam entrada transport-level, chamam use cases e traduzem erros para HTTP.
3. Uploads são assíncronos: a borda registra `QUEUED` e o worker faz compressão WebP e gravação definitiva.
4. Registros de documentos são auditáveis. O cron remove arquivo físico expirado, mas mantém o histórico como `EXPIRED_DELETED`.
5. `core.applications` é o gateway de autorização por aplicação; upload só aceita aplicações ativas.
6. CRUD administrativo de aplicações não tem autenticação interna nesta versão e deve ser protegido por rede/proxy externo.
7. Documentação deve ser atualizada no mesmo ciclo das mudanças de contrato, domínio, banco ou fluxo.
