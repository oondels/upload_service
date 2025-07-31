# 📂 API de Upload de Arquivos

Esta API permite o upload seguro de arquivos, organizando-os automaticamente em diretórios separados por serviço. Utiliza **Node.js**, **Express**, **Multer** e **Sharp** para processamento de imagens.

---

## 🚀 **Instalação e Configuração**

### **3️⃣ Configurar as variáveis de ambiente**

Crie um arquivo **`.env`** e defina as configurações:

```
UPLOAD_FOLDER=./uploads
PORT=9923
MAX_FILE_SIZE=5MB
ALLOWED_FILE_TYPES=jpeg,jpg,png,gif
```

Caso esteja rodando em produção, utilize um **`.env.prod`** e ajuste no arquivo **dotenv.js**.

### **4️⃣ Executar a API**

```
npm start
```

A API estará rodando na porta **9923**.

---

## 📌 **Rotas da API**

### **🔹 Upload de arquivos**

**Endpoint:** `POST /api/upload`

### **Headers**:

```
{
  "x-service": "fotos" // Nome do serviço (cria pasta automática)
}

```

### **Parâmetros (Query String - Alternativa ao Header)**:

```
/api/upload?service=fotos
```

### **Body (Form-Data):**

| Campo  | Tipo | Descrição                      |
| ------ | ---- | ------------------------------ |
| `file` | File | Arquivo a ser enviado (imagem) |

### **Exemplo de Resposta:**

```
{
  "message": "Upload realizado com sucesso!",
  "file": "/uploads/FOTOS/1708654321-imagem.jpg"
}
```

---

## 🛠 **Estrutura do Projeto**

```
upload-service/
│── src/
│   ├── config/
│   │   ├── dotenv.js     # Configuração de variáveis de ambiente
│   │   ├── multer.js     # Configuração do Multer (upload seguro)
│   ├── routes/
│   │   ├── upload.js     # Rota de upload
│   ├── index.js          # Arquivo principal da API
│── uploads/              # Diretório de uploads (criado automaticamente)
│── .env                  # Arquivo de variáveis de ambiente
│── .env.prod             # Configuração de produção
│── docker-compose.yml    # Configuração do Docker
│── Dockerfile            # Configuração do Container
│── package.json          # Dependências do projeto
```

---

## 🔐 **Segurança Implementada**

✅ **Uploads organizados em pastas separadas por serviço**
✅ **Tamanho máximo de arquivos limitado a 5MB**
✅ **Somente tipos de arquivo permitidos (JPEG, PNG, GIF)**
✅ **Proteção contra execução de scripts no diretório de upload**
✅ **Rate Limiting (200 requisições por IP a cada 2 min)**
✅ **Helmet ativado para segurança extra contra ataques comuns**

---

## 🐳 **Rodando com Docker**

### **1️⃣ Construir a imagem Docker**

```
docker-compose up -d --build
```

### **2️⃣ Parar o serviço**

```
docker-compose down
```

---

## 📡 **Testando com Postman**

1️⃣ **Método:** `POST`
2️⃣ **URL:** `http://localhost:9923/api/upload?service=fotos`
3️⃣ **Headers:**

```
Content-Type: multipart/form-data
x-service: fotos
```

4️⃣ **Body (Form-Data):**

- **Key:** `file` (tipo: `File`)
- **Escolha uma imagem** e envie.

---

## 📌 **Autor e Contato**

Criado por **[Seu Nome]** 🚀

Caso tenha dúvidas ou sugestões, entre em contato!
