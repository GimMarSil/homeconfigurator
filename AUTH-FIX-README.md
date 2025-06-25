# 🔐 Correções de Autenticação - Home Configurator

## 📋 Problemas Identificados e Corrigidos

### 1. **Hook `useApiData` não incluía headers de autenticação**
**Problema:** As chamadas à API não incluíam o token de autenticação nos headers
**Solução:** 
- Adicionado hook `useAuth` para obter dados do utilizador
- Criada função `getAuthHeaders()` que inclui Authorization Bearer token
- Adicionada verificação se utilizador está autenticado antes de fazer chamadas

### 2. **Middleware de autenticação com logs insuficientes**
**Problema:** Difícil debug de problemas de autenticação
**Solução:**
- Adicionados logs detalhados no middleware
- Implementado sistema de debug com `AuthDebugger`
- Melhor manuseamento de erros de parsing de token

### 3. **Falta de manuseamento de erros 401**
**Problema:** Loops de rendering e falta de fallback para sessões expiradas
**Solução:**
- Implementado logout automático em caso de 401
- Redirecionamento automático para login
- Prevenção de loops com verificações de estado

### 4. **Contexto de autenticação sem validação robusta**
**Problema:** Dados de utilizador podiam estar corrompidos no localStorage
**Solução:**
- Validação de dados ao carregar do localStorage
- Limpeza automática de dados inválidos
- Hook `useRequireAuth` para componentes protegidos

## 🔧 Ficheiros Modificados

### 📄 `hooks/use-api-data.tsx`
- ✅ Integração com contexto de autenticação
- ✅ Headers de autorização automáticos
- ✅ Manuseamento de erros 401 com logout automático
- ✅ Prevenção de chamadas sem autenticação

### 📄 `contexts/auth-context.tsx`
- ✅ Validação robusta de dados do utilizador
- ✅ Limpeza automática de dados inválidos
- ✅ Melhor manuseamento de erros de login
- ✅ Hook `useRequireAuth` adicional

### 📄 `lib/auth-middleware.ts`
- ✅ Logs detalhados para debug
- ✅ Integração com sistema de debug
- ✅ Melhor manuseamento de erros de parsing
- ✅ Validação mais robusta de tokens

### 📄 `components/protected-route.tsx`
- ✅ Suporte para verificação de super admin
- ✅ Melhor UI para erros de autorização
- ✅ Hook `useProtectedAuth` programático

### 📄 `lib/auth-debug.ts` (NOVO)
- ✅ Sistema completo de debug de autenticação
- ✅ Logs estruturados e análise de padrões
- ✅ Detecção automática de problemas
- ✅ Hook React para componentes

### 📄 `app/dashboard/auth-debug/page.tsx` (NOVO)
- ✅ Interface visual para debug de autenticação
- ✅ Monitorização em tempo real
- ✅ Testes de API integrados

### 📄 `scripts/test-auth.js` (NOVO)
- ✅ Script automatizado de testes de autenticação
- ✅ Verificação de cenários diversos
- ✅ Validação de proteções de API

## 🧪 Como Testar as Correções

### 1. **Teste Básico da Interface**
```bash
# Iniciar aplicação na porta 3001
npm run dev -- -p 3001

# Aceder à aplicação
http://localhost:3001

# Login como Super Admin
Email: admin@homeconfigurator.pt
Password: admin123
```

### 2. **Teste de Debug Visual**
```
1. Fazer login como Super Admin
2. Aceder a: http://localhost:3001/dashboard/auth-debug
3. Verificar:
   - Dados do utilizador atual
   - Resumo de autenticações
   - Logs de debug em tempo real
   - Testar chamada à API através da interface
```

### 3. **Teste Automatizado**
```bash
# Executar script de teste
node scripts/test-auth.js

# Ou com porta personalizada
BASE_URL=http://localhost:3001 node scripts/test-auth.js
```

### 4. **Teste Manual das APIs**
```bash
# 1. Fazer login e obter token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@homeconfigurator.pt","password":"admin123"}'

# 2. Usar token nas chamadas (substitua USER_DATA pelo JSON retornado)
curl -X GET http://localhost:3001/api/clientes \
  -H "Authorization: Bearer %7B%22id%22%3A0%2C%22name%22%3A%22Super%20Administrador%22%2C%22email%22%3A%22admin%40homeconfigurator.pt%22%2C%22role%22%3A%22super_admin%22%7D" \
  -H "Content-Type: application/json"
```

## 🐛 Debug e Resolução de Problemas

### **Console do Browser**
- Verificar se há logs de debug com prefixo "🔐 Auth Debug:"
- Verificar chamadas de rede na aba Network
- Verificar localStorage para dados do utilizador

### **Debug Visual**
- Aceder a `/dashboard/auth-debug` para interface visual
- Verificar resumo de autenticações
- Monitorizar logs em tempo real

### **Debug Programático**
```javascript
// No console do browser
import { debugAuthInfo } from '@/lib/auth-debug'
debugAuthInfo()
```

### **Verificação de Headers**
```javascript
// Verificar headers sendo enviados
const response = await fetch('/api/clientes', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ...',
    'Content-Type': 'application/json'
  }
})
```

## ⚠️ Problemas Conhecidos e Limitações

### **Produção vs Desenvolvimento**
- Sistema atual usa JSON como token (simplificado)
- Para produção, implementar JWT adequado
- Considerar refresh tokens para sessões longas

### **Segurança**
- Tokens armazenados em localStorage (OK para desenvolvimento)
- Para produção, considerar httpOnly cookies
- Implementar timeout de sessão

### **Performance**
- Debug logs só aparecem em desenvolvimento
- Sistema de logs tem limite de 50 entradas
- Logs são limpos automaticamente

## 📞 Suporte

### **Logs Úteis para Debug**
- Browser Console: Logs de autenticação com prefixo "🔐"
- Network Tab: Verificar headers Authorization
- `/dashboard/auth-debug`: Interface visual completa

### **Comandos Úteis**
```bash
# Limpar localStorage (se necessário)
localStorage.clear()

# Verificar dados do utilizador
localStorage.getItem('user')

# Executar debug no console
debugAuthInfo()
```

### **Cenários de Teste**
1. ✅ Login bem-sucedido
2. ✅ Logout automático em 401
3. ✅ Redirecionamento para login
4. ✅ Proteção de rotas super admin
5. ✅ Chamadas API com token correto
6. ✅ Rejeição de tokens inválidos

---

**Status:** ✅ Implementado e testado
**Compatibilidade:** Next.js 14+ 
**Última atualização:** {Data atual} 