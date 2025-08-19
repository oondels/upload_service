# PI de Upload de Arquivos

Esta API permite o upload seguro de arquivos, organizando-os automaticamente em diretórios separados por serviço. Utiliza **Node.js**, **Express**, **Multer** e **Sharp** para processamento de imagens.

---

## **Instalação e Configuração**

### ** Configurar as variáveis de ambiente**

Crie um arquivo **`.env.production`** e defina as configurações:

```
RABBITMQ_URL=<Url broker de mensagem>
UPLOAD_FOLDER=<pasta do servidor a se salvar>
FILE_URL_PATH=<Pasta servida via apache/nginx para acesso via <ip>/pasta>
MAX_FILE_SIZE=5 <mb>
ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.gif,.webp,.bmp,image/jpeg,image/png,image/gif,image/webp,image/bmp
DEV_ENV=
```

### **Executar a API com Docker**

```
docker compose -f docker-compose-production.yml up
```

A API estará rodando na porta **PORT**.

---

## **Rotas da API**

### **Upload de arquivos**

**Endpoint:** `POST /`

### **Headers**:

Adicione as Headers de acordo com a necessidade de sub pastas e reconhecimento de processo/aplicação

Exemplo:
```
{
  "x-service": "fotos" // Nome do serviço (cria pasta automática)
}

```

### **Body (Form-Data):**

| Campo  | Tipo | Descrição                      |
| ------ | ---- | ------------------------------ |
| `file` | File | Arquivo a ser enviado (imagem) |

---


---

## **Segurança Implementada**

✅ **Uploads organizados em pastas separadas por serviço**
✅ **Tamanho máximo de arquivos limitado a 5MB**
✅ **Somente tipos de arquivo permitidos (JPEG, PNG, GIF, ...)**
✅ **Proteção contra execução de scripts no diretório de upload**
✅ **Rate Limiting (200 requisições por IP a cada 2 min)**
✅ **Helmet ativado para segurança extra contra ataques comuns**

---

**Body (Form-Data):**

- **Key:** `file` (tipo: `File`)
- **Escolha uma imagem** e envie.

---
