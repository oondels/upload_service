# DASS Upload Service

API centralizada para gestão, compressão e armazenamento de documentos/imagens corporativas do ecossistema DASS.

O serviço recebe uploads via HTTP, valida se a aplicação cliente está cadastrada em `core.applications`, registra o documento no PostgreSQL, processa a imagem de forma assíncrona com BullMQ/Redis, converte para WebP com Sharp e remove arquivos expirados por rotina de cron.

> [!IMPORTANT]
> Este arquivo é apenas uma visão geral. Para arquitetura, domínio, fluxos, segurança e contratos HTTP, leia [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md).

## Stack

- Node.js com TypeScript
- Express.js
- PostgreSQL com TypeORM
- Redis + BullMQ
- Sharp para compressão WebP
- Multer para multipart/form-data
- Pino e OpenTelemetry

## Como Executar

```bash
npm install
npm run migration:run
npm run dev
```

## Scripts

```bash
npm run build
npm test
npm run migration:run
```

## Documentação

- [Design Spec](docs/DESIGN_SPEC.md)
