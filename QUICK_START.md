# 🚀 Quick Start - SCORM Viewer

Guia rápido para ter o sistema funcionando em 5 minutos!

## Passo 1: Instalar Dependências

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Passo 2: Configurar Ambiente

Crie o arquivo `backend/.env`:

```env
NODE_ENV=development
PORT=3001
ENABLE_CORS=true
CORS_ORIGIN=http://localhost:5173
ENABLE_RATE_LIMIT=true
ENABLE_HELMET=true
SESSION_TIMEOUT=1800000
MAX_FILE_SIZE=524288000
UPLOAD_TEMP_DIR=./temp
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=10
```

**Dica**: Você pode copiar `.env.example` e renomear para `.env`

## Passo 3: Iniciar Servidores

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Aguarde a mensagem: `✓ Server running on port 3001`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Aguarde a mensagem com a URL: `http://localhost:5173`

## Passo 4: Testar

1. Abra o navegador em `http://localhost:5173`
2. Arraste um arquivo .zip SCORM para a área de upload
3. Aguarde o processamento
4. O conteúdo será exibido automaticamente!

## ✅ Checklist de Verificação

- [ ] Node.js 18+ instalado
- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 5173
- [ ] Arquivo .env configurado
- [ ] Nenhum erro no console

## 🐛 Problemas Comuns

### Porta em uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Permissões de arquivo
```bash
# Certifique-se de que o diretório temp/ pode ser criado
mkdir -p backend/temp
```

### CORS Error
- Verifique se `CORS_ORIGIN` no `.env` está correto
- Deve ser `http://localhost:5173` em desenvolvimento

### Upload não funciona
- Verifique se o arquivo é .zip válido
- Verifique o tamanho (máx 500MB por padrão)
- Veja o console do backend para erros

## 📝 Comandos Úteis

```bash
# Ver logs do backend
cd backend && npm run dev

# Build do frontend para produção
cd frontend && npm run build

# Health check da API
curl http://localhost:3001/api/health

# Limpar diretórios temporários
rm -rf backend/temp/*
```

## 🎯 Próximos Passos

Depois que o sistema estiver funcionando:

1. Teste com diferentes pacotes SCORM
2. Leia o [README.md](README.md) completo para detalhes
3. Configure para produção quando necessário
4. Customize o visual em `frontend/src/App.css`

## 💡 Dicas

- Use `npm run dev` para desenvolvimento (auto-reload)
- Use `npm start` para produção
- Mantenha os dois terminais abertos durante desenvolvimento
- Arquivos SCORM são deletados automaticamente após 30 minutos

## 📞 Precisa de Ajuda?

Consulte o [README.md](README.md) completo para:
- Documentação completa da API
- Configurações avançadas
- Deployment em produção
- Segurança e validações
- Troubleshooting detalhado

---

**Está funcionando? Ótimo! 🎉**

Agora você pode visualizar qualquer pacote SCORM diretamente no navegador!
