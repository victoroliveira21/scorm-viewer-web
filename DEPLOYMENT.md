# Guia de Deploy - Scorm.Lab

Este guia detalha o processo de deploy do Scorm.Lab usando **Netlify** (frontend) e **Railway** (backend).

## Arquitetura de Deploy

```
Frontend (React + Vite) → Netlify
         ↓ (API calls)
Backend (Node.js + Express) → Railway
```

---

## 📋 Pré-requisitos

- Conta no [Netlify](https://www.netlify.com/)
- Conta no [Railway](https://railway.app/)
- Repositório Git com o código (GitHub, GitLab ou Bitbucket)
- Node.js 18+ instalado localmente para testes

---

## 🚀 Parte 1: Deploy do Backend (Railway)

### 1.1. Preparar o Repositório

Certifique-se de que o backend está em um repositório Git. Railway suporta:
- GitHub (recomendado)
- GitLab
- Bitbucket

### 1.2. Criar Novo Projeto no Railway

1. Acesse [railway.app](https://railway.app/)
2. Faça login e clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório do projeto
5. Railway detectará automaticamente que é um projeto Node.js

### 1.3. Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://seu-app.netlify.app
MAX_FILE_SIZE=524288000
UPLOAD_TEMP_DIR=./temp
SESSION_TIMEOUT=1800000
SESSION_CLEANUP_INTERVAL=300000
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=10
ENABLE_RATE_LIMIT=true
ENABLE_HELMET=true
ENABLE_CORS=true
```

**Importante:** Substitua `https://seu-app.netlify.app` pela URL real do Netlify após o deploy do frontend.

### 1.4. Configurar o Build

Railway detecta automaticamente o `package.json` e usa:
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Se necessário, você pode customizar em **Settings** → **Build Command**.

### 1.5. Deploy

1. Clique em **"Deploy"**
2. Railway fará o build e deploy automaticamente
3. Anote a URL gerada (ex: `https://scorm-viewer-production.up.railway.app`)

### 1.6. Configurar Domínio Customizado (Opcional)

1. Em **Settings** → **Domains**
2. Adicione um domínio customizado ou use o domínio Railway

---

## 🌐 Parte 2: Deploy do Frontend (Netlify)

### 2.1. Preparar o Repositório

O frontend deve estar no mesmo repositório ou em um repositório separado.

### 2.2. Conectar ao Netlify

1. Acesse [netlify.com](https://www.netlify.com/)
2. Faça login e clique em **"Add new site"** → **"Import an existing project"**
3. Conecte ao seu provedor Git (GitHub recomendado)
4. Selecione o repositório

### 2.3. Configurar Build Settings

Netlify detectará automaticamente as configurações do `netlify.toml`, mas verifique:

- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `frontend/dist`
- **Node version:** 18

### 2.4. Configurar Variáveis de Ambiente

No Netlify, vá em **Site settings** → **Environment variables** e adicione:

```env
VITE_API_URL=https://scorm-viewer-production.up.railway.app
```

**Importante:** Use a URL do Railway (sem `/api` no final).

### 2.5. Deploy

1. Clique em **"Deploy site"**
2. Netlify fará o build e deploy automaticamente
3. Anote a URL gerada (ex: `https://scormlab.netlify.app`)

### 2.6. Atualizar CORS no Backend

Volte ao Railway e atualize a variável `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://scormlab.netlify.app,http://localhost:5173
```

Isso permite tanto a produção quanto desenvolvimento local.

### 2.7. Configurar Domínio Customizado (Opcional)

1. Em **Domain settings**
2. Adicione um domínio customizado (ex: `scorm.simpllabs.com`)
3. Configure os registros DNS conforme instruções do Netlify

---

## ✅ Verificação do Deploy

### Testar o Backend

```bash
# Health check
curl https://seu-backend.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Testar o Frontend

1. Acesse `https://seu-app.netlify.app`
2. Verifique se a página carrega corretamente
3. Teste o upload de um arquivo SCORM
4. Verifique se o tema (light/dark) funciona
5. Teste a visualização do conteúdo SCORM

---

## 🔄 Deploy Contínuo

### Netlify

- Deploy automático a cada push na branch `main`
- Preview deploys para pull requests
- Rollback instantâneo em **Deploys** → **Production deploys**

### Railway

- Deploy automático a cada push na branch `main`
- Logs em tempo real em **Deployments**
- Rollback em **Deployments** → selecionar deploy anterior

---

## 📊 Monitoramento

### Netlify

- **Analytics:** Veja tráfego e performance
- **Functions logs:** (não usado neste projeto)
- **Deploy logs:** Erros de build

### Railway

- **Metrics:** CPU, memória, rede
- **Logs:** Logs da aplicação em tempo real
- **Alerts:** Configure alertas para downtime

---

## ⚠️ Considerações Importantes

### Storage Efêmero

Railway usa armazenamento efêmero. Os arquivos em `/temp` são limpos:
- A cada novo deploy
- Quando o container reinicia
- Após 30 minutos de inatividade (conforme `SESSION_TIMEOUT`)

Para produção de longo prazo, considere:
- Usar S3/Cloudflare R2 para armazenamento persistente
- Aumentar `SESSION_TIMEOUT` se necessário

### Limites do Plano Free

**Railway:**
- $5 de crédito mensal grátis
- ~140 horas de runtime por mês
- 1GB de RAM por serviço

**Netlify:**
- 100GB bandwidth/mês
- 300 build minutes/mês
- Deploy ilimitados

Para tráfego alto, considere planos pagos.

### Segurança

- ✅ HTTPS habilitado por padrão em ambos
- ✅ Rate limiting configurado (10 uploads/hora/IP)
- ✅ Helmet.js para headers de segurança
- ✅ Validação de arquivos ZIP
- ✅ CORS restrito

---

## 🐛 Troubleshooting

### Erro de CORS

**Sintoma:** "blocked by CORS policy" no console do browser

**Solução:**
1. Verifique `CORS_ORIGIN` no Railway inclui a URL do Netlify
2. Certifique-se de usar HTTPS (não HTTP)
3. Reinicie o backend após alterar variáveis

### Upload Falha

**Sintoma:** Erro 413 ou timeout

**Solução:**
1. Verifique `MAX_FILE_SIZE` no Railway (padrão: 500MB)
2. Aumente timeout se necessário (Railway Settings → Timeouts)
3. Verifique logs no Railway

### Build Falha no Netlify

**Sintoma:** "Build failed" no deploy

**Solução:**
1. Verifique `VITE_API_URL` está configurado
2. Confirme Node version 18+
3. Verifique logs de build detalhados
4. Teste build local: `npm run build`

### Arquivos SCORM não carregam

**Sintoma:** Tela branca após upload

**Solução:**
1. Verifique se o backend está respondendo (health check)
2. Confirme que `ENABLE_HELMET` está `true`
3. Verifique CSP headers permitem scripts inline
4. Teste com SCORM 1.2 simples primeiro

---

## 📚 Recursos Adicionais

- [Documentação Netlify](https://docs.netlify.com/)
- [Documentação Railway](https://docs.railway.app/)
- [SCORM Cloud Testing](https://cloud.scorm.com/)

---

## 🆘 Suporte

Para problemas específicos do Scorm.Lab, verifique:
1. Logs do Railway para erros de backend
2. Console do navegador para erros de frontend
3. Network tab para requisições falhadas

---

**Última atualização:** 2025-01-21
**Versão:** 1.0.0
