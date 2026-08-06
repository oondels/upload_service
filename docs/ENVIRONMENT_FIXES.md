# Histórico de Correções do Ambiente e API

Este documento detalha os problemas enfrentados durante a execução local do `upload_service` via Docker, as soluções aplicadas e o motivo de cada alteração.

---

## 1. Conexão com o Banco de Dados (PostgreSQL)

### Como estava
No arquivo `.env`, a variável de host do banco de dados estava configurada para apontar para o próprio container:
```env
DB_HOST=localhost
```

### O Problema
Ao iniciar a API via `docker compose up --build`, o container tentava procurar o PostgreSQL dentro de si mesmo (no endereço `127.0.0.1` ou `::1`). Como o banco de dados estava instalado fisicamente na máquina (ou em outro ambiente fora deste container), a conexão era recusada, gerando o erro:
`AggregateError [ECONNREFUSED] ... Error: connect ECONNREFUSED ::1:5432`

### Como ficou
Alteramos o host para o IP padrão do gateway da rede Docker no Linux (`172.17.0.1`), permitindo que o container saísse da sua rede isolada e enxergasse o serviço na máquina física.
```env
DB_HOST=172.17.0.1
```

---

## 2. Autenticação e Conexão com o Redis

### Como estava
No `.env`, a URL de conexão do Redis estava sem senha e apontando para um IP estático ou `localhost`:
```env
REDIS_URL=redis://172.17.0.1:6379
```

### O Problema
A API logava com sucesso no banco de dados, mas o serviço de mensageria disparava o erro `ReplyError: NOAUTH Authentication required`. O Redis possuía configuração de `--requirepass "minha-senha"`. Além disso, notou-se que o Redis rodava em um container na mesma rede externa (`dass_private`) que a API, o que invalidava a necessidade de usar IPs estáticos.

### Como ficou
Adicionamos a senha diretamente na string de conexão e passamos a usar o **hostname** do container do Redis (`redis`). Como ambos compartilham a rede `dass_private`, o Docker resolve o nome `redis` automaticamente.
```env
REDIS_URL=redis://:minha-senha@redis:6379
```

---

## 3. Bloqueio de Imagens pelo Navegador (CORP / Helmet)

### Como estava
No arquivo `src/app.ts`, a biblioteca de segurança [Helmet](https://helmetjs.github.io/) estava sendo inicializada com suas configurações padrão:
```typescript
app.use(helmet());
```

### O Problema
Ao tentar visualizar uma imagem carregada (ex: `.../uploads/imagem.webp`), o navegador bloqueava o recurso e exibia o erro `NS_ERROR_DOM_CORP_FAILED`. As versões recentes do Helmet injetam o cabeçalho `Cross-Origin-Resource-Policy: same-origin`, que proíbe sites de outras origens (como um frontend em `localhost:3000`) de carregar recursos visuais (imagens, scripts, etc) da API.

### Como ficou
A configuração do Helmet foi ajustada para permitir recursos de "origens cruzadas" (*cross-origin*), liberando a renderização no front-end:
```typescript
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
```

---

## 4. OpaqueResponseBlocking (ORB) e Erro 404 para Arquivos Estáticos

### Como estava
O código fonte do Express (`src/app.ts`) não possuía um mapeamento para servir a pasta onde as imagens estavam sendo salvas.

### O Problema
Após resolver o CORP, o navegador passou a dar o erro `NS_BINDING_ABORTED - A resource is blocked by OpaqueResponseBlocking`. Isso ocorria porque a tag `<img>` do front-end fazia a requisição e a API devolvia uma página HTML genérica de erro `404 Not Found` (já que a rota `/uploads` não existia). O navegador esperava uma imagem, recebeu um HTML 404, considerou a resposta "opaca/inválida" e bloqueou a renderização.

### Como ficou
Foram adicionadas a importação da biblioteca `path` e a configuração do middleware genérico `express.static`, que cria uma rota estática expondo o diretório de uploads fisicamente para web. Também reforçamos os cabeçalhos de CORS no momento de servir as imagens estáticas.

**Em `src/app.ts`:**
```typescript
import path from 'path';

// ...
const uploadPath = process.env.UPLOAD_FOLDER || path.resolve(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadPath, {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
```
