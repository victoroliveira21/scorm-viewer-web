# 🔍 Como Funciona o Scorm.Lab

Este documento explica de forma simples como o Scorm.Lab funciona.

---

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  VOCÊ (USUÁRIO)                                     │
│  Acessa pelo navegador                              │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 │ https://
                 ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│  NETLIFY (Frontend)                                 │
│  ├─ Página visual (React)                           │
│  ├─ Botão de upload                                 │
│  ├─ Switch de tema                                  │
│  └─ Visualizador de SCORM                           │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Envia arquivo .zip
                 │ via API
                 ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│  RAILWAY (Backend)                                  │
│  ├─ Recebe o arquivo                                │
│  ├─ Valida o ZIP                                    │
│  ├─ Descompacta os arquivos                         │
│  ├─ Lê o manifesto SCORM                            │
│  ├─ Cria uma sessão temporária                      │
│  └─ Serve os arquivos para visualização             │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Retorna URL do SCORM
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│  VISUALIZADOR                                       │
│  Mostra o conteúdo SCORM em um iframe              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 O Que Cada Parte Faz

### 1️⃣ NETLIFY (Frontend)

**O que é:** A "cara" do Scorm.Lab que você vê no navegador.

**O que faz:**
- Mostra a página bonita com a logo
- Permite arrastar e soltar arquivos
- Mostra a barra de progresso do upload
- Muda entre tema claro e escuro
- Abre o visualizador quando o SCORM está pronto

**Tecnologias:**
- React (biblioteca para criar interfaces)
- Vite (ferramenta de build)
- CSS (para deixar bonito)

**Por que Netlify?**
- É grátis para começar
- Muito rápido (CDN global)
- HTTPS automático
- Deploy automático quando você atualiza o código

---

### 2️⃣ RAILWAY (Backend)

**O que é:** O "cérebro" do Scorm.Lab que processa os arquivos.

**O que faz:**
1. **Recebe o arquivo ZIP** que você envia
2. **Valida** se é um ZIP válido e seguro
3. **Descompacta** todos os arquivos dentro do ZIP
4. **Lê o manifesto** (imsmanifest.xml) para entender o SCORM
5. **Cria uma sessão** temporária (como uma pasta temporária)
6. **Serve os arquivos** para o navegador poder mostrar
7. **Limpa tudo** depois de 30 minutos (para não lotar o servidor)

**Tecnologias:**
- Node.js (JavaScript no servidor)
- Express (framework web)
- Multer (para receber arquivos)
- adm-zip (para descompactar ZIPs)

**Por que Railway?**
- É grátis para começar
- Fácil de usar
- Detecta Node.js automaticamente
- Logs em tempo real

---

## 🔄 Fluxo Completo de Upload

Vamos ver o que acontece quando você faz upload de um SCORM:

### Passo 1: Você seleciona o arquivo
```
Você → Clica ou arrasta um arquivo .zip
     → Frontend valida que é um .zip
     → Mostra "Processando..."
```

### Passo 2: Frontend envia para o Backend
```
Frontend → Cria um FormData com o arquivo
         → Envia POST para /api/upload
         → Mostra barra de progresso
```

### Passo 3: Backend processa
```
Backend → Recebe o arquivo
        → Valida magic bytes (verifica que é ZIP de verdade)
        → Verifica tamanho (máx 500MB)
        → Bloqueia arquivos perigosos (.exe, .dll, etc)
        → Descompacta para pasta temp/sessions/[id-aleatório]
```

### Passo 4: Backend lê o manifesto
```
Backend → Procura imsmanifest.xml
        → Lê usando XML parser
        → Identifica versão (SCORM 1.2 ou 2004)
        → Encontra arquivo de entrada (index.html, etc)
        → Retorna informações para o Frontend
```

### Passo 5: Frontend abre o visualizador
```
Frontend → Recebe ID da sessão
         → Cria iframe apontando para /api/sessions/[id]/viewer
         → Backend serve o arquivo de entrada
         → SCORM carrega dentro do iframe
         → Você vê o conteúdo!
```

### Passo 6: Limpeza automática
```
Backend → A cada 5 minutos, verifica sessões antigas
        → Se passou 30 minutos, deleta os arquivos
        → Libera espaço no servidor
```

---

## 🔒 Segurança

O Scorm.Lab tem várias camadas de segurança:

### No Frontend:
- ✅ HTTPS obrigatório (Netlify)
- ✅ Validação de tipo de arquivo (.zip apenas)
- ✅ Headers de segurança

### No Backend:
- ✅ Validação de magic bytes (detecta arquivos falsos)
- ✅ Limite de tamanho (500MB)
- ✅ Bloqueio de executáveis (.exe, .dll, .bat, etc)
- ✅ Proteção contra zip bombs
- ✅ Proteção contra directory traversal
- ✅ Rate limiting (máx 10 uploads por hora por IP)
- ✅ CORS (só aceita requisições do Netlify)
- ✅ Helmet.js (headers de segurança)
- ✅ Limpeza automática de arquivos antigos

---

## 📁 Onde Ficam os Arquivos?

### Durante o Processamento:
```
Railway Server
└─ temp/
   ├─ uploads/       (arquivo ZIP original - deletado após processar)
   └─ sessions/
      └─ abc123/     (arquivos extraídos - deletado após 30 min)
         ├─ imsmanifest.xml
         ├─ index.html
         └─ [outros arquivos do SCORM]
```

### Importante:
- ⚠️ Railway usa **armazenamento efêmero**
- Isso significa que os arquivos são temporários
- A cada novo deploy, tudo é limpo
- Perfeito para visualizador (não queremos guardar SCORMs para sempre)

---

## 🌍 Como Funciona o CORS?

CORS = Cross-Origin Resource Sharing (compartilhamento entre origens diferentes)

### O Problema:
```
Netlify:  https://seu-app.netlify.app
Railway:  https://seu-backend.railway.app
          ↑ Domínios diferentes!
```

Por segurança, navegadores bloqueiam requisições entre domínios diferentes.

### A Solução:
O backend Railway diz: "Eu aceito requisições do Netlify!"

```javascript
// No backend
CORS_ORIGIN = https://seu-app.netlify.app
```

Assim o navegador permite a comunicação. ✅

---

## 🎨 Como Funciona o Tema?

### Armazenamento:
```
localStorage['scormlab-theme'] = 'dark' ou 'light'
```

### CSS Variables:
```css
/* Tema escuro */
:root[data-theme="dark"] {
  --bg-gradient-start: #0a0a0a;
  --text-primary: #e0e0e0;
  --accent-primary: #F4D06F;
}

/* Tema claro */
:root[data-theme="light"] {
  --bg-gradient-start: #f5f5f5;
  --text-primary: #333333;
  --accent-primary: #D4A017;
}
```

### Detecção Automática:
```javascript
// Detecta preferência do sistema
window.matchMedia('(prefers-color-scheme: dark)')
```

Se você nunca escolheu um tema, ele usa o tema do seu sistema operacional!

---

## 📊 Custos Estimados

### Plano Free (adequado para testes):

**Netlify:**
- ✅ 100GB bandwidth/mês
- ✅ 300 minutos de build/mês
- ✅ Deploy ilimitados
- 💰 $0/mês

**Railway:**
- ✅ $5 de crédito/mês
- ✅ ~140 horas de runtime
- ✅ 1GB RAM
- 💰 $0/mês (usa créditos)

### Para Produção:

Se você tiver muito tráfego:
- Netlify Pro: $19/mês
- Railway: $5/mês por serviço

---

## 🚀 Deploy Contínuo

Depois de configurar tudo, fazer updates é automático:

```bash
# Você faz mudanças no código
git add .
git commit -m "Adicionei nova funcionalidade"
git push

# ⏰ Railway detecta → build → deploy (2-3 min)
# ⏰ Netlify detecta → build → deploy (2-3 min)

# ✅ Seu site é atualizado automaticamente!
```

Não precisa fazer nada manual! 🎉

---

## 📈 Monitoramento

### Ver se está funcionando:

**Backend (Railway):**
```
https://seu-backend.railway.app/api/health

Resposta esperada:
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2025-01-21...",
  "version": "1.0.0"
}
```

**Frontend (Netlify):**
- Abra a URL no navegador
- Deve carregar a página normalmente

### Ver logs:

**Railway:**
- Dashboard → seu projeto → Deployments → View Logs

**Netlify:**
- Dashboard → seu site → Deploys → último deploy → Deploy log

---

## ❓ Perguntas Frequentes

### Por que duas plataformas (Netlify + Railway)?

Porque são especializadas:
- **Netlify:** Ótimo para sites estáticos (HTML, CSS, JS)
- **Railway:** Ótimo para aplicações backend (Node.js, APIs)

Poderíamos usar só Railway, mas seria mais caro e mais trabalho para configurar.

### Os arquivos SCORM ficam salvos para sempre?

Não! Eles são deletados após 30 minutos. O Scorm.Lab é um **visualizador**, não um LMS (sistema de gerenciamento).

### Posso usar para produção com muitos usuários?

Sim, mas no plano free tem limites. Para muitos usuários simultâneos, considere os planos pagos.

### E se o Railway "dormir"?

No plano free, se ficar sem usar por um tempo, ele "dorme". O primeiro acesso depois pode demorar ~30 segundos para "acordar".

### Posso usar meu próprio domínio?

Sim! Tanto Netlify quanto Railway permitem domínios customizados. Basta configurar os registros DNS.

---

## 📚 Próximos Passos

Agora que você entende como funciona, pode:

1. ✅ Seguir o [GUIA-DEPLOY-SIMPLES.md](./GUIA-DEPLOY-SIMPLES.md)
2. ✅ Usar o [CHECKLIST-DEPLOY.md](./CHECKLIST-DEPLOY.md) para acompanhar
3. ✅ Colocar online!
4. 🎉 Compartilhar com o mundo

**Boa sorte! 🚀**
