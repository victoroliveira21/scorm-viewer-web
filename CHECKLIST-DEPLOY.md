# ✅ Checklist de Deploy - Scorm.Lab

Use este checklist para acompanhar seu progresso no deploy.

---

## PREPARAÇÃO

- [ ] Tenho conta no GitHub
- [ ] Tenho conta no Railway
- [ ] Tenho conta no Netlify
- [ ] Tenho Git instalado no computador
- [ ] Tenho o código do Scorm.Lab funcionando localmente

---

## PARTE 1: GITHUB

- [ ] Criei o repositório no GitHub
- [ ] Executei `git init` na pasta do projeto
- [ ] Executei `git add .`
- [ ] Executei `git commit -m "Initial commit"`
- [ ] Executei `git remote add origin [URL]`
- [ ] Executei `git push -u origin main`
- [ ] Consigo ver o código no GitHub

**✅ URL do repositório:** _____________________________________

---

## PARTE 2: BACKEND (RAILWAY)

- [ ] Criei conta no Railway
- [ ] Conectei Railway ao GitHub
- [ ] Criei novo projeto no Railway
- [ ] Selecionei o repositório correto
- [ ] Configurei Root Directory como `backend`
- [ ] Configurei Start Command como `npm start`
- [ ] Adicionei todas as variáveis de ambiente:
  - [ ] NODE_ENV
  - [ ] PORT
  - [ ] MAX_FILE_SIZE
  - [ ] UPLOAD_TEMP_DIR
  - [ ] SESSION_TIMEOUT
  - [ ] SESSION_CLEANUP_INTERVAL
  - [ ] RATE_LIMIT_WINDOW
  - [ ] RATE_LIMIT_MAX
  - [ ] ENABLE_RATE_LIMIT
  - [ ] ENABLE_HELMET
  - [ ] ENABLE_CORS
  - [ ] CORS_ORIGIN
- [ ] Deploy completou com sucesso
- [ ] Gerei um domínio no Railway
- [ ] Testei /api/health e funciona
- [ ] Copiei a URL do Railway

**✅ URL do backend:** _____________________________________

---

## PARTE 3: FRONTEND (NETLIFY)

- [ ] Criei conta no Netlify
- [ ] Conectei Netlify ao GitHub
- [ ] Importei o repositório
- [ ] Configurei Base Directory como `frontend`
- [ ] Configurei Build Command como `npm run build`
- [ ] Configurei Publish Directory como `frontend/dist`
- [ ] Adicionei variável VITE_API_URL com URL do Railway
- [ ] Deploy completou com sucesso
- [ ] Consigo acessar a URL do Netlify
- [ ] A página do Scorm.Lab abre corretamente
- [ ] Copiei a URL do Netlify

**✅ URL do frontend:** _____________________________________

---

## PARTE 4: CONEXÃO

- [ ] Voltei ao Railway
- [ ] Atualizei CORS_ORIGIN com a URL do Netlify
- [ ] Aguardei o redeploy do backend (1-2 min)
- [ ] Backend reiniciou com sucesso

---

## TESTES FINAIS

### Funcionalidades Básicas
- [ ] Consigo acessar a URL do Netlify
- [ ] A logo aparece corretamente
- [ ] O título "Scorm.Lab" aparece em amarelo
- [ ] O rodapé com "Simpl.Labs" aparece

### Upload de SCORM
- [ ] Consigo fazer upload de um arquivo .zip
- [ ] A barra de progresso aparece
- [ ] O SCORM abre no visualizador
- [ ] Consigo navegar no conteúdo SCORM
- [ ] O botão "X" fecha o visualizador

### Tema
- [ ] O switch de tema aparece no canto superior direito
- [ ] Consigo alternar entre tema claro e escuro
- [ ] As cores mudam corretamente
- [ ] O tema escolhido é salvo (ao recarregar a página)

### Responsividade
- [ ] Testei no celular e funciona
- [ ] Testei em tablet e funciona
- [ ] Testei em diferentes navegadores

### Performance
- [ ] A página carrega rápido (< 3 segundos)
- [ ] O upload processa em tempo razoável
- [ ] Não há erros no console do navegador (F12)

---

## CONFIGURAÇÕES OPCIONAIS

### Domínio Customizado (Netlify)
- [ ] Configurei domínio personalizado
- [ ] Atualizei DNS
- [ ] HTTPS está funcionando
- [ ] Atualizei CORS_ORIGIN no Railway com novo domínio

### Domínio Customizado (Railway)
- [ ] Configurei domínio personalizado no Railway
- [ ] Atualizei VITE_API_URL no Netlify
- [ ] Testei e funciona

---

## MONITORAMENTO

- [ ] Sei onde ver os logs do Railway
- [ ] Sei onde ver os logs do Netlify
- [ ] Configurei notificações de deploy (opcional)
- [ ] Tenho a documentação salva

---

## 🎉 DEPLOY COMPLETO!

Data do deploy: ____/____/________

URLs em produção:
- Frontend: _______________________________________________
- Backend:  _______________________________________________

---

## PRÓXIMOS PASSOS

- [ ] Compartilhar URL com a equipe
- [ ] Testar com SCORMs reais
- [ ] Configurar domínio customizado
- [ ] Monitorar uso e performance
- [ ] Planejar upgrades se necessário

---

## NOTAS PESSOAIS

_Use este espaço para anotar qualquer observação importante:_

___________________________________________________________________

___________________________________________________________________

___________________________________________________________________

___________________________________________________________________

___________________________________________________________________
