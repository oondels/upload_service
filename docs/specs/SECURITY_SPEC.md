# Security Specification — DASS Upload Service

> [!CAUTION]
> Sistemas expostos publicamente que executam primitivas I/O manipuláveis via disco e persistência de blob local são os alvos mais propícios à vetorizações diretas clássicas. As diretrizes em vigor não são opcionais.

---

## 1. Muro contra Path Traversal Attacks

O payload `filePath` ou chaves deterministas dinâmicas provindas da ponta foram absolutamente abolidas do parser da aplicação. O backend assume posse determinística das rotas.

A topologia impõe as seguintes regras na confecção dos caminhos reais do Node `fs`:
1. Uma raiz blindada na variável oculta de máquina no `.env` (`STORAGE_PATH`).
2. O nome do segundo nó (*Child Node*) **jamais** utilizará o input literal sem antes ser passado por uma verificação SQL `WHERE is_active = true`. A string virá da coluna `folder_name` limpa.
3. Se houvessem subpastas aninhadas futuras, todas serão higienizadas por *Regular Expressions* (permitindo apenas `[a-zA-Z0-9_-]`) finalizadas sob proteção de um cast via `path.normalize()`, impedindo saltos `../../../`.

## 2. Barreira Gated Access para Órfãos

A criação irrestrita de árvores de diretórios é estritamente proibida. Todo serviço requisitante (frontends de sistemas DASS) deverá primeiramente se classificar como uma entidade no painel central da nossa estrutura sob o domínio de `Application`. Operações desconhecidas tomarão imediatamente bloqueio 403 HTTP.

## 3. Gestão Anti-OOM (Out-of-Memory) & CPU Spike

O *parser* (`Multer`) deve atestar seus freios na ponta (`limits.fileSize`) rejeitando anomalias binárias infladas (Bomb payloads) antes mesmo do upload total completar sua alocação na RAM temporal do host.
As mitigações de pico na CPU da VPS são mitigadas pelo Worker Queue, já que requisições assíncronas concorrentes nunca baterão o processo do Sharp (cujas transformações e re-encodificações ocupam muita thread) ao mesmo tempo em tempo real, travando o event-loop para os demais. O paralelismo é coordenado pelas filas configuráveis do Redis/BullMQ.
