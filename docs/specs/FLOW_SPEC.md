# Flow Specification — DASS Upload Service

> [!NOTE]
> Para entidades e status, leia [DOMAIN_SPEC.md](DOMAIN_SPEC.md).

---

## 1. Fluxo de Upload Assíncrono

### Objetivo
Permitir a recepção segura de grandes lotes de uploads sem congestionamento (Event-Loop blocked) do servidor e garantir compressão eficiente das mídias.

### Etapas

#### Etapa 1 — Recepção e Reserva HTTP (`QUEUED`)
- **Quem:** API Controller e Provider Local (`multer`).
- **Pré-condição:** A tag `application` informada encontra respaldo num registro `isActive = true` no banco.
- **Ação:** O controller salva fisicamente a imagem crua no ambiente temporário (`/storage/tmp`). A API persiste no Postgres o tracking em `QUEUED` com o `expiresAt` calculado.
- **Efeito colateral:** Produz um *job* imediato na fila BullMQ (`queue: upload-processor`).
- **Retorno HTTP:** A borda encerra a conexão rápido e envia um JSON *202 Accepted* com o `correlationId`.

#### Etapa 2 — Processamento de Imagem (`COMPACTING`)
- **Quem:** Worker local do BullMQ escutando `upload-processor`.
- **Pré-condição:** Job existente no Redis; registro PostgreSQL localizado.
- **Ação:** O Worker atualiza o banco para `COMPACTING`. Instancia a leitura do buffer do diretório `/tmp` via biblioteca Sharp, e realiza conversão otimizada (ex: para formato webp, resize de max Width/Height padronizados).

#### Etapa 3 — Escrita Definitiva em Disco (`SAVED`)
- **Quem:** Worker do BullMQ.
- **Ação:** O Worker realiza o dump file da versão comprimida para a árvore definitiva: `/storage/{application.folderName}/{generatedUuid}.webp`.
- **Persistência:** Commita um `UPDATE` no PostgreSQL para `SAVED`, registrando as rotas em `fileUrl` e `filePath`.
- **Limpeza colateral atômica:** Invoca o serviço de I/O de disco e deleta obrigatoriamente a origem crua dentro do `/tmp`.

---

## 2. Fluxo de Retenção e Higienização de I/O (Cron Job)

### Objetivo
Servir como o coletor de lixo corporativo, evitando a interrupção da VPS DASS por erro clássico de limite de armazenamento atingido (No space left on device).

### Etapas

#### Etapa 1 — Scheduler (Varredura)
- **Quem:** Thread cron paralela.
- **Frequência Sugerida:** Diariamente as 03h00 AM.
- **Ação:** Executa um SELECT rápido utilizando indexação: `WHERE expires_at < NOW() AND status = 'SAVED'`. 

#### Etapa 2 — Descarte de Lixo Físico
- **Quem:** Storage Service.
- **Ação:** Para o cursor iterado na query, chama primitivas `fs.unlinkSync()` para os blocos apontados nos `filePaths` respectivos, apagando fisicamente da VPS.

#### Etapa 3 — Manutenção da Verdade Histórica
- **Quem:** Database Repository.
- **Ação:** Invoca batch update comutando todos os processados na etapa 2 para o status terminador `EXPIRED_DELETED`. A auditoria (quando chegou, que sistema foi, peso) ficará para sempre disponível.
