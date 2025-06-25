/**
 * Configuração central da aplicação
 * Mantem todas as configurações de URLs, APIs e ambiente em um local
 */

// Detectar ambiente
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// URLs base
const getBaseUrl = () => {
  // Se estiver no browser (client-side)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Se houver variável de ambiente definida
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Fallback baseado no ambiente
  if (isDevelopment) {
    return 'http://localhost:3001' // Fixed port to match current setup
  }
  
  // Em produção, usar o domínio atual
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001'
}

export const config = {
  // URLs
  baseUrl: getBaseUrl(),
  apiUrl: typeof window !== 'undefined' ? '' : getBaseUrl(), // Usar URL relativa no browser
  
  // Configurações da API
  api: {
    timeout: 15000, // 15 segundos (increased for better reliability)
    retries: 3,
    retryDelay: 1000, // 1 segundo
  },
  
  // Autenticação
  auth: {
    cookieName: 'user',
    tokenKey: 'homeconfig_token',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Debug
  debug: {
    enabled: isDevelopment || process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true',
    logLevel: isDevelopment ? 'debug' : 'error',
  },
  
  // Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  
  // Ambiente
  isDevelopment,
  isProduction,
  isServer: typeof window === 'undefined',
  isClient: typeof window !== 'undefined',
}

// Função para construir URL da API
export const buildApiUrl = (endpoint: string): string => {
  // Se o endpoint já for uma URL completa, retornar como está
  if (endpoint.startsWith('http')) {
    return endpoint
  }
  
  // Se estiver no browser, usar URL relativa
  if (typeof window !== 'undefined') {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }
  
  // Se estiver no servidor, usar URL completa
  const baseUrl = config.baseUrl
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  return `${baseUrl}${cleanEndpoint}`
}

// Função para detectar a porta atual
export const getCurrentPort = (): number => {
  if (typeof window !== 'undefined') {
    return parseInt(window.location.port) || (window.location.protocol === 'https:' ? 443 : 80)
  }
  
  // No servidor, tentar detectar a partir das variáveis de ambiente
  return parseInt(process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3001')
}

// Logs de configuração (apenas em desenvolvimento)
if (config.debug.enabled && typeof window !== 'undefined') {
  console.log('🔧 App Configuration:', {
    baseUrl: config.baseUrl,
    currentPort: getCurrentPort(),
    environment: process.env.NODE_ENV,
    debug: config.debug.enabled
  })
} 