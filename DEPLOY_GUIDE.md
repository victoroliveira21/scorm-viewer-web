# 🌐 Guia de Deploy - SCORM Viewer

## Como colocar o sistema online (sem custos ou baixo custo)

### Opção 1: Deploy Simples e Gratuito (Recomendado para começar)

Esta opção usa serviços gratuitos para você testar online sem gastar nada.

#### Backend: Railway.app (Gratuito)

1. **Crie conta no Railway**: https://railway.app
2. **Clique em "New Project" → "Deploy from GitHub repo"**
3. **Configure:**
   ```
   Root Directory: backend
   Start Command: npm start
   ```
4. **Adicione variáveis de ambiente:**
   ```env
   NODE_ENV=production
   PORT=3001
   ENABLE_CORS=true
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ENABLE_RATE_LIMIT=true
   ENABLE_HELMET=true
   SESSION_TIMEOUT=1800000
   MAX_FILE_SIZE=524288000
   RATE_LIMIT_WINDOW=3600000
   RATE_LIMIT_MAX=10
   ```
5. **Railway vai gerar uma URL**: `https://seu-backend.railway.app`

#### Frontend: Vercel (Gratuito)

1. **Crie conta no Vercel**: https://vercel.com
2. **Clique em "Import Project" → Escolha seu repositório**
3. **Configure:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Adicione variável de ambiente:**
   ```
   VITE_API_URL=https://seu-backend.railway.app
   ```
5. **Vercel vai gerar uma URL**: `https://seu-site.vercel.app`

#### Atualizar código do Frontend

Edite `frontend/src/services/api.ts`:

```typescript
// Antes (desenvolvimento):
const API_BASE_URL = '/api';

// Depois (produção):
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

**PRONTO!** Seu site estará online e funcionando! 🎉

---

### Opção 2: VPS Completo (Para controle total)

Use se você quer controle total e está ok em pagar ~$5-10/mês.

#### Provedores recomendados:
- **DigitalOcean** - $6/mês (droplet básico)
- **Linode** - $5/mês
- **Vultr** - $5/mês
- **Hostinger** - ~R$20/mês (Brasil)

#### Passos:

1. **Crie um servidor Ubuntu 22.04**

2. **Instale Node.js 18+:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Instale Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

4. **Clone seu código:**
   ```bash
   cd /var/www
   git clone seu-repositorio scorm-viewer
   cd scorm-viewer
   ```

5. **Configure Backend:**
   ```bash
   cd backend
   npm install --production

   # Crie .env de produção
   nano .env
   ```

   Adicione:
   ```env
   NODE_ENV=production
   PORT=3001
   ENABLE_CORS=true
   CORS_ORIGIN=https://seusite.com
   # ... outras variáveis
   ```

6. **Inicie Backend com PM2:**
   ```bash
   pm2 start src/server.js --name scorm-backend
   pm2 save
   pm2 startup
   ```

7. **Build Frontend:**
   ```bash
   cd ../frontend

   # Edite vite.config.ts para apontar para seu domínio
   npm install
   npm run build

   # Copie arquivos compilados para Nginx
   sudo cp -r dist/* /var/www/html/
   ```

8. **Configure Nginx** (`/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name seusite.com;

       # Frontend (arquivos estáticos)
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Reinicie Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Configure SSL (HTTPS) com Let's Encrypt:**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d seusite.com
    ```

**PRONTO!** Acesse `https://seusite.com` 🎉

---

### Opção 3: Serviços Separados (Flexível)

Combine diferentes serviços:

#### Backend:
- **Render** (gratuito até certo ponto)
- **Heroku** (pago, mas confiável)
- **AWS EC2** (para escala)
- **Google Cloud Run** (paga por uso)

#### Frontend:
- **Vercel** (gratuito, super rápido)
- **Netlify** (gratuito, fácil)
- **Cloudflare Pages** (gratuito + CDN)
- **AWS S3 + CloudFront** (barato, escalável)

---

## 💰 Comparação de Custos

| Opção | Custo Mensal | Dificuldade | Escalabilidade |
|-------|--------------|-------------|----------------|
| Railway + Vercel | **R$ 0** | ⭐ Fácil | ⭐⭐ Média |
| VPS (DigitalOcean) | **~R$ 30** | ⭐⭐ Média | ⭐⭐⭐ Alta |
| AWS/Cloud | **Variável** | ⭐⭐⭐ Difícil | ⭐⭐⭐⭐ Muito Alta |

---

## 🚀 Minha Recomendação

**Para começar agora (testar online):**
→ Use **Railway (backend) + Vercel (frontend)** - GRÁTIS!

**Para produção séria (muitos usuários):**
→ Use **VPS (DigitalOcean)** - Controle total por ~R$30/mês

**Para escala massiva (milhares de usuários):**
→ Migre para **AWS/Google Cloud** com auto-scaling

---

## 🔧 Checklist de Deploy

Antes de colocar online, verifique:

- [ ] Arquivo `.env` configurado com valores de produção
- [ ] CORS_ORIGIN apontando para URL do frontend real
- [ ] SESSION_TIMEOUT adequado (30 min está bom)
- [ ] RATE_LIMIT_MAX configurado (10/hora pode ser baixo para produção)
- [ ] MAX_FILE_SIZE adequado ao seu caso
- [ ] Frontend fazendo requisições para URL real do backend
- [ ] SSL/HTTPS configurado (obrigatório para segurança)
- [ ] Backup automático configurado (se VPS)
- [ ] Monitoramento ativo (Uptime Robot, etc.)

---

## 📞 Suporte

- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs
- **DigitalOcean**: https://docs.digitalocean.com
- **Nginx**: https://nginx.org/en/docs/

---

## 🎯 Próximos Passos

1. **Agora**: Teste localmente para garantir que tudo funciona
2. **Depois**: Faça deploy gratuito no Railway + Vercel para testar online
3. **Futuro**: Quando tiver usuários reais, migre para VPS ou cloud

**Lembre-se**: Você pode começar grátis e só gastar quando realmente precisar! 💪
