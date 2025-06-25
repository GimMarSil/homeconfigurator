# 🔧 Configuração Flexível - Home Configurator

## 🤔 Por que não fixar portas?

Estava a usar **porta 3001** baseado na sua mensagem inicial, mas tem toda a razão - **fixar portas é uma má prática** porque:

1. **🌍 Ambientes diferentes** - Desenvolvimento, staging, produção usam portas diferentes
2. **🔄 Conflitos de porta** - Outros serviços podem estar a usar a mesma porta
3. **📦 Deploy automático** - Plataformas como Vercel/Netlify definem portas dinamicamente
4. **👥 Equipa** - Diferentes developers podem usar portas diferentes localmente

## ✅ Nova Abordagem Implementada

### 🏗️ **Configuração Central (`lib/config.ts`)**
- ✅ Detecção automática de URL base
- ✅ Suporte a variáveis de ambiente
- ✅ Fallbacks inteligentes
- ✅ Configuração de timeout e retry

### 🌐 **Cliente API Robusto (`lib/api-client.ts`)**
- ✅ Retry automático em caso de falha
- ✅ Timeout configurável
- ✅ Tratamento elegante de erros de rede
- ✅ Logout automático em 401
- ✅ Logs detalhados para debug

### 🔄 **Hook Melhorado (`hooks/use-api-data.tsx`)**
- ✅ Verificação de status da rede
- ✅ Fallback visual para problemas de conexão
- ✅ Não fazer chamadas se offline
- ✅ Toast contextual baseado no tipo de erro

## 🚀 Como Usar

### **1. Desenvolvimento Local (Porta Padrão)**
```bash
npm run dev
# Usa automaticamente http://localhost:3000
```

### **2. Desenvolvimento Local (Porta Customizada)**
```bash
npm run dev -- -p 3001
# OU
PORT=3001 npm run dev
# Detecta automaticamente a porta
```

### **3. Com Variável de Ambiente**
```bash
# .env.local (criar este ficheiro)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Ou diretamente no terminal
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
```

### **4. Produção**
```bash
# Usa automaticamente window.location.origin
npm run build && npm start
```

## 🧪 Scripts de Teste Flexíveis

### **Teste Básico**
```bash
node scripts/test-auth.js
# Detecta a porta automaticamente
```

### **Teste com Porta Específica**
```bash
PORT=3001 node scripts/test-auth.js
# OU
NEXT_PUBLIC_API_URL=http://localhost:3001 node scripts/test-auth.js
```

### **Teste Remoto**
```bash
BASE_URL=https://meuapp.vercel.app node scripts/test-auth.js
```

## 🔍 Debug e Monitorização

### **Health Check**
```bash
curl http://localhost:3000/api/health
# Verifica status da aplicação e base de dados
```

### **Debug de Configuração**
No browser console:
```javascript
// Ver configuração atual
console.log(window.location.origin)

// Testar conectividade
fetch('/api/health').then(r => r.json()).then(console.log)
```

### **Logs Automáticos**
Em desenvolvimento, a configuração é automaticamente logged:
```
🔧 App Configuration: {
  baseUrl: "http://localhost:3000",
  currentPort: 3000,
  environment: "development",
  debug: true
}
```

## 🌐 Variáveis de Ambiente Suportadas

### **Para URL da API**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # URL completa da API
BASE_URL=http://localhost:3001             # Fallback alternativo
PORT=3001                                  # Porta do servidor
NEXT_PUBLIC_PORT=3001                      # Porta alternativa
```

### **Para Debug**
```bash
NEXT_PUBLIC_DEBUG_AUTH=true                # Ativar logs de debug
NODE_ENV=development                       # Ambiente (auto-detectado)
```

### **Para Configuração da API**
```bash
MAX_FILE_SIZE=10485760                     # Tamanho máximo de upload
```

## 🔧 Como Funciona

### **1. Detecção Automática de URL**
```typescript
const getBaseUrl = () => {
  // No browser - usar URL atual
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Variável de ambiente explícita
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Fallback inteligente
  return `http://localhost:${PORT || 3000}`
}
```

### **2. Cliente API com Retry**
```typescript
// Retry automático com backoff
for (let attempt = 1; attempt <= retries + 1; attempt++) {
  try {
    const response = await fetchWithTimeout(url, options, timeout)
    // ...
  } catch (error) {
    // Aguardar antes do retry (1s, 2s, 3s...)
    await new Promise(resolve => 
      setTimeout(resolve, retryDelay * attempt)
    )
  }
}
```

### **3. Tratamento de Erros Contextual**
```typescript
if (errorMessage.includes('Timeout') || errorMessage.includes('fetch')) {
  setNetworkStatus('offline')
  toast.error('Problema de conexão. Verifique a sua ligação à internet.')
} else if (errorMessage.includes('401')) {
  handleAuthError() // Logout automático
}
```

## 🎯 Benefícios da Nova Abordagem

### **✅ Flexibilidade**
- Funciona em qualquer porta
- Adapta-se automaticamente ao ambiente
- Suporta desenvolvimento e produção

### **✅ Robustez**
- Retry automático em falhas de rede
- Timeout para evitar travamentos
- Fallbacks para cenários offline

### **✅ UX Melhorada**
- Feedback visual do status da rede
- Toasts contextuais baseados no erro
- Logout automático quando necessário

### **✅ Debug Facilitado**
- Logs estruturados em desenvolvimento
- Health check endpoint
- Configuração visível no console

## 🚨 Resolução de Problemas

### **"Failed to fetch"**
```bash
# Verificar se a aplicação está a correr
npm run dev

# Verificar health check
curl http://localhost:3000/api/health

# Ver logs de rede no browser
F12 > Network > tentar nova requisição
```

### **"CORS Error"**
- ✅ **Resolvido automaticamente** - Usando URLs relativas no browser
- ✅ **Sem configuração extra** - Next.js manuseia CORS internamente

### **"Port already in use"**
```bash
# Usar porta diferente
npm run dev -- -p 3001

# Ou matar processo na porta
npx kill-port 3000
```

## 📞 Suporte

### **Comandos Úteis**
```bash
# Verificar configuração atual
node -e "console.log(require('./lib/config.js').config)"

# Testar conectividade
node scripts/test-auth.js

# Health check manual
curl http://localhost:3000/api/health | jq
```

### **Exemplos de Configuração**

#### **.env.local (Desenvolvimento)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_DEBUG_AUTH=true
PORT=3001
```

#### **package.json (Scripts customizados)**
```json
{
  "scripts": {
    "dev:3001": "next dev -p 3001",
    "test:auth": "node scripts/test-auth.js",
    "health": "curl http://localhost:3000/api/health"
  }
}
```

---

**🎯 Agora a aplicação é verdadeiramente flexível!** Não há mais portas fixas, e o sistema adapta-se automaticamente ao ambiente de execução com tratamento robusto de erros e fallbacks inteligentes. 