# SCORM Viewer - Backend API

Backend Node.js para visualizador de pacotes SCORM production-ready.

## Características

- ✅ Upload seguro com validação completa
- ✅ Proteção contra zip bombs e malware
- ✅ Sistema de sessões com auto-cleanup
- ✅ Rate limiting e CORS configuráveis
- ✅ Suporta SCORM 1.2 e SCORM 2004
- ✅ API RESTful completa

## Instalação

```bash
cd backend
npm install
```

## Configuração

1. Copie `.env.example` para `.env`
2. Ajuste as configurações conforme necessário

## Desenvolvimento

```bash
npm run dev
```

Servidor rodará em `http://localhost:3001`

## Produção

```bash
npm start
```

## API Endpoints

### POST /api/upload
Upload de pacote SCORM

**Request:**
- Content-Type: multipart/form-data
- Body: file (ZIP)

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid",
  "manifest": {
    "title": "Course Title",
    "version": "SCORM 1.2",
    "entryPoint": "index.html",
    "fileCount": 50
  },
  "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/sessions/:sessionId/viewer
Retorna viewer HTML com API SCORM mock

### GET /api/sessions/:sessionId/files/*
Serve arquivos do pacote SCORM

### GET /api/sessions/:sessionId/manifest
Retorna metadados do manifest

### DELETE /api/sessions/:sessionId
Deleta sessão manualmente

### GET /api/health
Health check

## Segurança

- Validação de magic bytes (ZIP)
- Bloqueio de executáveis
- Proteção contra zip bombs
- Directory traversal prevention
- Rate limiting configurável
- Helmet security headers
- CORS configurável

## Estrutura

```
backend/
├── src/
│   ├── controllers/     # Lógica de negócio
│   ├── routes/          # Definição de rotas
│   ├── middleware/      # Middlewares customizados
│   └── utils/           # Utilitários (sessions, security, parsing)
├── temp/                # Arquivos temporários (auto-gerado)
├── .env                 # Configurações
└── package.json
```

## Licença

MIT
