# Serviço de Upload de Arquivos

API para receber uploads de arquivos, armazená-los em diretórios organizados por serviço e enfileirar o processamento dos metadados via RabbitMQ.

---

## Instalação e Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.production` com as seguintes variáveis:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `RABBITMQ_URL` | Sim | URL de conexão com o broker RabbitMQ. |
| `UPLOAD_FOLDER` | Sim | Diretório local onde os arquivos são salvos. |
| `FILE_URL_PATH` | Sim | Prefixo público para acessar os arquivos (ex.: `/static`). |
| `MAX_FILE_SIZE` | Sim | Tamanho máximo permitido por arquivo, em MB. |
| `ALLOWED_FILE_TYPES` | Sim | Lista de tipos e extensões aceitas (separadas por vírgula). |
| `DEV_ENV` | Não | Define o ambiente de desenvolvimento. |

### Executar com Docker

```bash
docker compose -f docker-compose-production.yml up

```

O serviço estará disponível na porta `9923`.

---

## Endpoints

### 1. Health Check

Verifica se o serviço está ativo.

- **Método:** `GET`
- **Rota:** `/`

### Exemplo de Requisição

```bash
curl -X GET http://localhost:9923/

```

### Exemplo de Resposta

```json
{
  "message": "Upload service"
}

```

---

### 2. Upload de Arquivos

Recebe arquivos e enfileira o processamento dos metadados.

- **Método:** `POST`
- **Rota:** `/`

### Parâmetros

| Tipo | Nome | Obrigatório | Descrição |
| --- | --- | --- | --- |
| Header | `x-service` | Sim | Identificador do serviço (usado em subpastas). |
| Header | `x-dass-office` | Sim | Unidade de origem do upload. |
| Body | `files[]` | Sim | Um ou mais arquivos enviados. |
| Body | `data` | Não | Informações adicionais em JSON. |

> Os parâmetros service e dassOffice também podem ser enviados via query string, mas recomenda-se o uso de cabeçalhos.
> 

### Exemplo de Requisição

```bash
curl -X POST http://localhost:9923/ \
  -H "x-service: fotos" \
  -H "x-dass-office: 123" \
  -F "files=@/caminho/imagem.jpg" \
  -F "data={\"user_id\": 1}"

```

### Exemplo de Resposta de Sucesso

```json
{
  "message": "Uploads enfileirados para processamento!",
  "files": [
    {
      "correlationId": "uuid",
      "timesTamp": "2024-01-01T12:00:00.000Z",
      "fileSize": 12345,
      "filePath": "uploads/fotos/uuid.jpg",
      "fileUrl": "/static/fotos/uuid.jpg",
      "fileName": "uuid.jpg",
      "title": "uuid.jpg"
    }
  ],
  "serviceName": "fotos"
}

```

### Possíveis Erros

| Status | Mensagem | Descrição |
| --- | --- | --- |
| `400` | `"Nenhum arquivo enviado"` | Nenhum arquivo foi enviado no formulário. |
| `400` | `"O nome do serviço é obrigatório! Use 'x-service'."` | Cabeçalho `x-service` ausente. |
| `400` | `"O cabeçalho 'x-dass-office' é obrigatório!"` | Cabeçalho `x-dass-office` ausente. |
| `500` | `"Erro ao processar a requisição"` | Falha interna ao salvar ou enfileirar. |

---

## Segurança Implementada

- Uploads separados em pastas por serviço.
- Limite de tamanho de arquivo (5 MB por padrão).
- Aceita apenas tipos de arquivo permitidos.
- Diretório de upload protegido contra execução de scripts.
- Rate limiting (10 requisições por IP a cada 2 minutos).
- Helmet ativado para proteção contra ataques comuns.

---

## Observações

- Esta API não possui autenticação nativa. Recomenda-se o uso de HTTPS e mecanismos externos de autenticação quando necessário.