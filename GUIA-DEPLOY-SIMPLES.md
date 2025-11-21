# 🚀 Guia Simples de Deploy - Scorm.Lab

Este é um guia passo a passo para colocar o Scorm.Lab online pela primeira vez.

---

## 📝 Antes de Começar

Você vai precisar:
1. ✅ Uma conta no GitHub (para guardar o código)
2. ✅ Uma conta no Railway (para o backend - a parte que processa os arquivos)
3. ✅ Uma conta no Netlify (para o frontend - a parte que o usuário vê)

**Todas as contas têm plano gratuito!**

---

## PARTE 1: Preparar o Código no GitHub

### Passo 1.1: Criar Repositório no GitHub

1. Entre no [github.com](https://github.com)
2. Clique no **"+"** no canto superior direito
3. Escolha **"New repository"**
4. Preencha:
   - **Repository name:** `scorm-viewer-web`
   - **Description:** `Visualizador de SCORM - Scorm.Lab`
   - Deixe **Public** selecionado
   - ❌ NÃO marque "Add a README file"
5. Clique em **"Create repository"**

### Passo 1.2: Subir o Código para o GitHub

Abra o terminal na pasta do projeto e execute:

```bash
# Navegar até a pasta do projeto
cd "C:\Users\IEG-030\Desktop\Projetos\scorm-viewer-web"

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Criar o primeiro commit
git commit -m "Initial commit - Scorm.Lab v1.0"

# Conectar ao repositório do GitHub (SUBSTITUA 'seu-usuario' pelo seu nome de usuário do GitHub)
git remote add origin https://github.com/seu-usuario/scorm-viewer-web.git

# Enviar o código
git push -u origin main
```

**Se der erro dizendo que a branch é 'master' e não 'main', use:**
```bash
git branch -M main
git push -u origin main
```

✅ **Pronto!** Seu código está no GitHub agora.

---

## PARTE 2: Colocar o Backend no Ar (Railway)

O backend é a parte que:
- Recebe os arquivos SCORM
- Descompacta os ZIPs
- Serve os arquivos para o visualizador

### Passo 2.1: Criar Conta no Railway

1. Entre no [railway.app](https://railway.app)
2. Clique em **"Login"**
3. Escolha **"Login with GitHub"** (mais fácil)
4. Autorize o Railway a acessar sua conta do GitHub

### Passo 2.2: Criar o Projeto

1. No painel do Railway, clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Se for a primeira vez, clique em **"Configure GitHub App"**
4. Selecione o repositório `scorm-viewer-web`
5. Clique em **"Deploy Now"**

### Passo 2.3: Configurar a Pasta do Backend

Railway vai tentar fazer deploy de todo o repositório, mas queremos só a pasta `backend`.

1. Clique no card do seu deploy (vai aparecer "scorm-viewer-web")
2. Vá em **"Settings"** (engrenagem no canto)
3. Role até **"Service Settings"**
4. Em **"Root Directory"**, digite: `backend`
5. Em **"Start Command"**, digite: `npm start`
6. Clique fora para salvar

### Passo 2.4: Adicionar Variáveis de Ambiente

Ainda em Settings, role até **"Variables"**:

1. Clique em **"+ New Variable"**
2. Adicione uma por uma (clique em "+ New Variable" para cada):

```
NODE_ENV = production
PORT = 3001
MAX_FILE_SIZE = 524288000
UPLOAD_TEMP_DIR = ./temp
SESSION_TIMEOUT = 1800000
SESSION_CLEANUP_INTERVAL = 300000
RATE_LIMIT_WINDOW = 3600000
RATE_LIMIT_MAX = 10
ENABLE_RATE_LIMIT = true
ENABLE_HELMET = true
ENABLE_CORS = true
CORS_ORIGIN = http://localhost:5173
```

**Nota:** Vamos atualizar `CORS_ORIGIN` depois que o frontend estiver no ar.

### Passo 2.5: Fazer o Deploy

1. Volte para a aba **"Deployments"**
2. Railway vai fazer o deploy automaticamente
3. Aguarde uns 2-3 minutos
4. Quando aparecer ✅ **"SUCCESS"**, está pronto!

### Passo 2.6: Pegar a URL do Backend

1. Vá em **"Settings"**
2. Role até **"Domains"**
3. Clique em **"Generate Domain"**
4. Uma URL será criada (tipo: `scorm-viewer-production.up.railway.app`)
5. **COPIE ESSA URL** e guarde num bloco de notas (vamos usar depois)

### Passo 2.7: Testar o Backend

Abra o navegador e acesse:
```
https://SUA-URL-DO-RAILWAY.railway.app/api/health
```

Você deve ver algo assim:
```json
{
  "status": "ok",
  "uptime": 12.345,
  "timestamp": "2025-01-21T...",
  "version": "1.0.0"
}
```

✅ **Backend funcionando!**

---

## PARTE 3: Colocar o Frontend no Ar (Netlify)

O frontend é a página que o usuário acessa para fazer upload dos SCORMs.

### Passo 3.1: Criar Conta no Netlify

1. Entre no [netlify.com](https://www.netlify.com)
2. Clique em **"Sign up"**
3. Escolha **"GitHub"** (mais fácil)
4. Autorize o Netlify

### Passo 3.2: Criar o Site

1. No painel do Netlify, clique em **"Add new site"**
2. Escolha **"Import an existing project"**
3. Clique em **"GitHub"**
4. Procure e selecione `scorm-viewer-web`
5. Clique no repositório

### Passo 3.3: Configurar o Build

Na tela de configuração, preencha:

- **Branch to deploy:** `main`
- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `frontend/dist`

### Passo 3.4: Adicionar Variável de Ambiente

**ANTES de clicar em "Deploy":**

1. Clique em **"Show advanced"**
2. Clique em **"New variable"**
3. Preencha:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://SUA-URL-DO-RAILWAY.railway.app` (a URL que você copiou antes, **SEM /api no final**)

### Passo 3.5: Fazer o Deploy

1. Clique em **"Deploy site"**
2. Aguarde 2-3 minutos
3. Quando aparecer ✅ **"Published"**, está pronto!

### Passo 3.6: Pegar a URL do Frontend

1. Na página do seu site, procure a URL (tipo: `amazing-unicorn-123456.netlify.app`)
2. Clique nela para abrir
3. **COPIE ESSA URL** completa (com https://)

### Passo 3.7: Testar o Frontend

Abra a URL do Netlify no navegador. Você deve ver:
- A logo da caixa
- "Scorm.Lab" em amarelo
- "Arraste um arquivo .zip aqui"
- O switch de tema no canto superior direito

✅ **Frontend funcionando!**

---

## PARTE 4: Conectar Frontend e Backend

Agora precisamos dizer ao backend que ele pode aceitar requisições do frontend.

### Passo 4.1: Atualizar CORS no Railway

1. Volte ao Railway ([railway.app](https://railway.app))
2. Abra seu projeto
3. Clique no card do deploy
4. Vá em **"Variables"**
5. Encontre `CORS_ORIGIN`
6. Clique no lápis para editar
7. Altere para:
   ```
   https://SUA-URL-DO-NETLIFY.netlify.app,http://localhost:5173
   ```
   Exemplo:
   ```
   https://amazing-unicorn-123456.netlify.app,http://localhost:5173
   ```
   (Note a vírgula separando as duas URLs)

8. Pressione Enter para salvar

### Passo 4.2: Aguardar o Redeploy

Railway vai reiniciar o backend automaticamente (leva 1-2 minutos).

---

## ✅ TESTE FINAL

### Passo 5.1: Testar Upload

1. Acesse a URL do Netlify
2. Clique ou arraste um arquivo SCORM .zip
3. Aguarde o processamento
4. O SCORM deve abrir automaticamente

### Passo 5.2: Testar o Tema

1. Clique no switch no canto superior direito
2. O tema deve alternar entre claro e escuro

### Passo 5.3: Testar em Outro Dispositivo

1. Abra a URL do Netlify no celular
2. Teste o upload
3. Tudo deve funcionar igual

---

## 🎉 PARABÉNS!

Seu Scorm.Lab está no ar! Agora você pode:

- Compartilhar a URL com outras pessoas
- Testar SCORMs
- Acessar de qualquer lugar

---

## 🔄 Como Atualizar Depois

Quando você fizer mudanças no código:

```bash
# Na pasta do projeto
git add .
git commit -m "Descrição da mudança"
git push
```

Railway e Netlify vão atualizar automaticamente! ✨

---

## 🆘 Problemas Comuns

### "CORS error" no navegador

**Solução:** Verifique se você colocou a URL correta do Netlify no `CORS_ORIGIN` do Railway.

### Upload não funciona

**Solução:**
1. Abra o console do navegador (F12)
2. Vá em "Network"
3. Tente fazer upload
4. Se der erro 404, verifique se `VITE_API_URL` está correta no Netlify

### Página em branco

**Solução:**
1. Verifique os logs no Netlify (Site overview → Deploys → clique no último deploy → Deploy log)
2. Pode ser erro de build - verifique se todas as configurações estão corretas

### Backend dá timeout

**Solução:**
Railway pode "dormir" no plano free. O primeiro acesso após inatividade pode demorar ~30 segundos.

---

## 💰 Custos

**Plano Free:**
- Railway: $5 de crédito/mês (~140 horas)
- Netlify: 100GB bandwidth/mês

Para uso pessoal ou testes, é suficiente! ✅

Para produção com muitos usuários, considere os planos pagos:
- Railway: $5/mês por serviço
- Netlify: $19/mês

---

## 📞 Precisa de Ajuda?

Se algo não funcionar:

1. Verifique os logs no Railway (Deployments → clique no deploy → View Logs)
2. Verifique os logs no Netlify (Site overview → Deploys)
3. Abra o console do navegador (F12) para ver erros

---

**Boa sorte! 🚀**
