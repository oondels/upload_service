# Design Specification — DASS Upload Service

Este documento é o mapa central de engenharia do projeto.

Ele não substitui as specs específicas. Use este arquivo para decidir quais documentos devem ser lidos antes de implementar, corrigir ou revisar uma funcionalidade.

---

## Arquitetura de Documentação

A documentação segue o princípio de Lazy Loading de Contexto.
Leia primeiro este arquivo. Depois, abra apenas as specs necessárias para a tarefa atual.

> [!WARNING]
> Não carregue todas as specs sem necessidade.
> Para economizar contexto e reduzir risco de interpretação incorreta, leia apenas os arquivos relacionados à alteração em andamento.

---

## Índice de Specs

| Spec | Escopo | Quando ler |
|---|---|---|
| [DOMAIN_SPEC.md](specs/DOMAIN_SPEC.md) | Entidades (Application, UploadedDocument) e status | Alterações em entidades, campos, status ou retenção |
| [FLOW_SPEC.md](specs/FLOW_SPEC.md) | Fluxos assíncronos (Upload) e CronJobs | Alterações em jornadas de upload, BullMQ ou limpeza |
| [DATABASE_SPEC.md](specs/DATABASE_SPEC.md) | Schemas do PostgreSQL | Alterações em banco, migrations ou índices |
| [API_SPEC.md](specs/API_SPEC.md) | Contratos HTTP | Alterações em endpoints |
| [SECURITY_SPEC.md](specs/SECURITY_SPEC.md) | Validações e Path Traversal | Alterações em geração de caminhos, storage ou autorização |

---

## Separação Física do Projeto (Clean Architecture)

```text
src/
├── domain/                  # Entidades principais e contratos/interfaces de domínio
├── application/             # Casos de uso e orquestração de negócios (Use Cases)
├── infrastructure/          # Detalhes de implementação (HTTP, Postgres, BullMQ, Storage)
└── main/                    # Injeção de dependências e inicialização (Composition Root)
```

---

## Regras Gerais de Arquitetura

1. **Inversão de Dependências:** Casos de uso NUNCA instanciam conexões com banco de dados, storage ou mensageria diretamente. Eles devem usar as interfaces definidas em `domain/contracts/`.
2. **Stateless Edge:** As requisições HTTP da borda (`routes/controllers`) devem ser extremamente rápidas. Salvam fisicamente de forma temporária, reservam no banco e delegam o trabalho de transformação de imagem (Sharp) e salvamento definitivo para *workers* assíncronos via BullMQ.
3. **Imutabilidade de Auditoria:** Arquivos físicos podem ser removidos do disco por rotinas de cron job, mas o registro histórico no PostgreSQL é imutável em seu rastreio temporal (apenas a coluna status sofre mutação final para `EXPIRED_DELETED`).
