# DASS Upload Service

## Sobre

API centralizada para gestão, otimização e armazenamento de documentos e imagens corporativas do ecossistema DASS.
Este serviço recebe uploads, orquestra a otimização de imagens de forma assíncrona usando filas, armazena os arquivos de forma segura em disco de VPS e limpa registros expirados automaticamente.

> [!IMPORTANT]
> Este arquivo é apenas uma visão geral.
>
> Para entender arquitetura, domínio, fluxos, permissões e integrações, leia:
>
> - [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md)

## Stack

### Backend
- Node.js com TypeScript
- Express.js
- BullMQ (Mensageria assíncrona)
- Sharp (Processamento de Imagens)
- Multer

### Banco de Dados
- PostgreSQL

### Infraestrutura
- Redis (Docker - Ecossistema)
- Disco Local da VPS (Storage)

## Como Executar

```bash
npm install
npm run dev
```

## Documentação
- [Design Spec](docs/DESIGN_SPEC.md)
