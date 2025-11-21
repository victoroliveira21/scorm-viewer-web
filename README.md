# SCORM Viewer Web

Um visualizador de pacotes SCORM moderno e seguro, pronto para uso em produção. Permite que usuários façam upload e visualizem conteúdos SCORM 1.2 e SCORM 2004 diretamente no navegador.

## 📋 Características

- ✅ **Suporte completo**: SCORM 1.2 e SCORM 2004
- 🔒 **Seguro**: Validações completas (zip bombs, malware, executáveis)
- ⚡ **Rápido**: Interface moderna com React + TypeScript + Vite
- 🎨 **UI moderna**: Design gradiente responsivo com drag-and-drop
- 🕒 **Sessões temporárias**: Auto-limpeza após 30 minutos
- 🚦 **Rate limiting**: Proteção contra abuso (10 uploads/hora)
- 🎯 **Pronto para produção**: Configurações de segurança e performance

## 🏗️ Arquitetura

### Backend
- **Node.js + Express**: API REST para processamento de SCORM
- **Multer**: Upload de arquivos com validação
- **adm-zip**: Extração segura de pacotes ZIP
- **fast-xml-parser**: Parsing do imsmanifest.xml
- **Helmet + CORS**: Segurança e controle de acesso
- **express-rate-limit**: Proteção contra abuso

### Frontend
- **React 18**: Interface de usuário moderna
- **TypeScript**: Tipagem estática para confiabilidade
- **Vite**: Build tool rápido com HMR
- **Axios**: Comunicação com API
- **CSS moderno**: Gradientes e animações

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### 1. Clonar o repositório

```bash
cd scorm-viewer-web
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Server
NODE_ENV=development
PORT=3001

# File Upload
MAX_FILE_SIZE=524288000
UPLOAD_TEMP_DIR=./temp

# Session Management
SESSION_TIMEOUT=1800000

# Security
ENABLE_HELMET=true
ENABLE_CORS=true
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
ENABLE_RATE_LIMIT=true
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=10
```

Inicie o backend:

```bash
npm start
```

Ou em modo de desenvolvimento (com nodemon):

```bash
npm run dev
```

O backend estará disponível em `http://localhost:3001`

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Inicie o frontend:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### 4. Testar

1. Abra `http://localhost:5173` no navegador
2. Arraste um arquivo .zip SCORM ou clique para selecionar
3. Aguarde o processamento
4. O conteúdo SCORM será exibido automaticamente

## 📁 Estrutura do Projeto

```
scorm-viewer-web/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── uploadController.js    # Lógica de upload
│   │   │   └── sessionController.js   # Gerenciamento de sessões
│   │   ├── routes/
│   │   │   ├── upload.js              # Rotas de upload
│   │   │   └── session.js             # Rotas de sessão
│   │   ├── utils/
│   │   │   ├── sessionManager.js      # Gerenciamento de sessões
│   │   │   ├── manifestParser.js      # Parse do SCORM
│   │   │   └── securityValidator.js   # Validações de segurança
│   │   └── server.js                  # Servidor Express
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadZone.tsx         # Área de upload
│   │   │   ├── Viewer.tsx             # Visualizador SCORM
│   │   │   └── ErrorDisplay.tsx       # Exibição de erros
│   │   ├── services/
│   │   │   └── api.ts                 # Cliente API
│   │   ├── App.tsx                    # Componente principal
│   │   ├── App.css                    # Estilos
│   │   └── main.tsx                   # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── README.md                          # Este arquivo
```

## 🔒 Segurança

### Validações Implementadas

1. **Magic Bytes**: Valida que o arquivo é um ZIP válido
2. **Extensão**: Aceita apenas arquivos .zip
3. **Tamanho**: Limite de 500MB por padrão
4. **Zip Bomb**: Detecta arquivos com taxa de descompressão suspeita (>100:1)
5. **Executáveis**: Bloqueia .exe, .dll, .bat, .cmd, .sh, .ps1, etc.
6. **Directory Traversal**: Previne acesso a arquivos fora do diretório da sessão
7. **Rate Limiting**: 10 uploads por hora por IP
8. **CORS**: Controle de origem cross-domain
9. **Helmet**: Headers de segurança HTTP

### Arquivos Bloqueados

```javascript
.exe, .dll, .bat, .cmd, .sh, .ps1, .com, .scr, .vbs, .jar
```

## 🎯 API Endpoints

### POST /api/upload
Upload de pacote SCORM

**Request:**
- Content-Type: multipart/form-data
- Body: { scormPackage: File }

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid-v4",
  "manifest": {
    "title": "Nome do Curso",
    "entryPoint": "index.html",
    "version": "1.2"
  },
  "message": "Upload successful"
}
```

### GET /api/sessions/:sessionId/manifest
Obter informações do manifesto

**Response:**
```json
{
  "title": "Nome do Curso",
  "entryPoint": "index.html",
  "version": "1.2",
  "files": ["index.html", "styles.css", ...]
}
```

### GET /api/sessions/:sessionId/viewer
Obter HTML do visualizador com SCORM API

**Response:** HTML com API mock integrado

### GET /api/sessions/:sessionId/files/*
Servir arquivos do pacote SCORM

**Response:** Arquivo solicitado com MIME type apropriado

### DELETE /api/sessions/:sessionId
Deletar sessão e arquivos

**Response:**
```json
{
  "success": true,
  "message": "Session deleted"
}
```

### GET /api/health
Health check do servidor

**Response:**
```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2025-01-20T...",
  "version": "1.0.0"
}
```

## ⚙️ Configurações

### Variáveis de Ambiente (.env)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| NODE_ENV | Ambiente (development/production) | development |
| PORT | Porta do servidor | 3001 |
| MAX_FILE_SIZE | Tamanho máximo de upload (bytes) | 524288000 (500MB) |
| UPLOAD_TEMP_DIR | Diretório temporário | ./temp |
| SESSION_TIMEOUT | Timeout da sessão (ms) | 1800000 (30 min) |
| ENABLE_HELMET | Ativar headers de segurança | true |
| ENABLE_CORS | Ativar CORS | true |
| CORS_ORIGIN | Origem permitida | http://localhost:5173 |
| ENABLE_RATE_LIMIT | Ativar rate limiting | true |
| RATE_LIMIT_WINDOW | Janela de rate limit (ms) | 3600000 (1 hora) |
| RATE_LIMIT_MAX | Máximo de requisições | 10 |

## 🧪 Testes

### Testar Backend (manual)

```bash
# Health check
curl http://localhost:3001/api/health

# Upload SCORM
curl -X POST http://localhost:3001/api/upload \
  -F "scormPackage=@/path/to/scorm.zip"
```

### Testar Frontend

1. Acesse `http://localhost:5173`
2. Teste com pacotes SCORM de exemplo
3. Verifique console do navegador para erros

## 📦 Build para Produção

### Backend

```bash
cd backend
npm install --production
NODE_ENV=production PORT=3001 npm start
```

### Frontend

```bash
cd frontend
npm run build
```

Os arquivos otimizados estarão em `frontend/dist/`

Sirva com nginx, Apache, ou qualquer servidor estático.

## 🌐 Deployment

### Opção 1: VPS Tradicional (DigitalOcean, Linode, AWS EC2)

1. Configure servidor Ubuntu 20.04+
2. Instale Node.js 18+
3. Configure nginx como reverse proxy
4. Use PM2 para gerenciar processos
5. Configure SSL com Let's Encrypt

### Opção 2: Plataformas PaaS

- **Heroku**: Suporte nativo a Node.js
- **Railway**: Deploy com Git
- **Render**: Build automático
- **Vercel**: Frontend (serverless functions para backend)

### Opção 3: Serverless

- AWS Lambda + API Gateway + S3
- Google Cloud Functions + Cloud Storage
- Azure Functions + Blob Storage

## 🔄 Gerenciamento de Sessões

- Sessões são criadas no upload e expiram em 30 minutos
- Limpeza automática a cada 5 minutos
- Arquivos temporários são deletados automaticamente
- Em produção, considere usar Redis para armazenamento de sessões

## ⚠️ Limitações Conhecidas

1. **Armazenamento**: Atualmente usa sistema de arquivos local
   - Para produção multi-servidor, use storage compartilhado (S3, etc.)

2. **Sessões**: Armazenadas em memória (Map)
   - Para produção, migre para Redis ou similar

3. **SCORM API**: Mock básico sem persistência de progresso
   - Suficiente para visualização, não para LMS completo

4. **Autenticação**: Não implementada
   - Adicione se necessário para controle de acesso

## 🛠️ Desenvolvimento Futuro

- [ ] Autenticação de usuários
- [ ] Persistência de progresso SCORM
- [ ] Dashboard administrativo
- [ ] Analytics de uso
- [ ] Suporte a xAPI/Tin Can
- [ ] Suporte a cmi5
- [ ] Migração para Redis
- [ ] Testes automatizados (Jest, Cypress)
- [ ] CI/CD pipeline

## 📄 Licença

Este projeto foi criado para uso pessoal e educacional.

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças maiores, abra uma issue primeiro.

## 📞 Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando Node.js, React e TypeScript**
