/**
 * Utilitários para gestão de tokens e sessões
 */

export interface UserToken {
  id: number
  name: string
  email: string
  role: string
  clienteId?: number
  clienteNome?: string
  timestamp?: number
}

// Duração máxima de sessão (24 horas em milissegundos)
const SESSION_DURATION = 24 * 60 * 60 * 1000

/**
 * Validar se o token é válido e não expirou
 */
export function validateToken(userData: any): boolean {
  try {
    // Verificar se os campos obrigatórios existem
    if (!userData || 
        userData.id === undefined || 
        userData.id === null || 
        !userData.email || 
        !userData.role) {
      console.warn('Token validation failed: missing required fields')
      return false
    }

    // Verificar expiração se timestamp existe
    if (userData.timestamp) {
      const now = Date.now()
      const tokenAge = now - userData.timestamp
      
      if (tokenAge > SESSION_DURATION) {
        console.warn('Token validation failed: session expired')
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error validating token:', error)
    return false
  }
}

/**
 * Criar token com timestamp
 */
export function createToken(userData: Omit<UserToken, 'timestamp'>): UserToken {
  return {
    ...userData,
    timestamp: Date.now()
  }
}

/**
 * Obter token do localStorage com validação
 */
export function getValidToken(): UserToken | null {
  try {
    if (typeof window === 'undefined') {
      return null // SSR
    }

    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      return null
    }

    const userData = JSON.parse(savedUser)
    
    // Validar token
    if (!validateToken(userData)) {
      // Token inválido, limpar localStorage
      localStorage.removeItem('user')
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      return null
    }

    return userData
  } catch (error) {
    console.error('Error getting valid token:', error)
    // Limpar dados corrompidos
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
    return null
  }
}

/**
 * Salvar token no localStorage e cookie
 */
export function saveToken(userData: UserToken): void {
  try {
    if (typeof window === 'undefined') {
      return // SSR
    }

    const tokenWithTimestamp = createToken(userData)
    
    // Salvar no localStorage
    localStorage.setItem('user', JSON.stringify(tokenWithTimestamp))
    
    // Salvar no cookie
    const cookieValue = encodeURIComponent(JSON.stringify(tokenWithTimestamp))
    document.cookie = `user=${cookieValue}; path=/; max-age=86400; samesite=strict`
    
    console.log('Token saved successfully')
  } catch (error) {
    console.error('Error saving token:', error)
  }
}

/**
 * Limpar token do localStorage e cookie
 */
export function clearToken(): void {
  try {
    if (typeof window === 'undefined') {
      return // SSR
    }

    localStorage.removeItem('user')
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    
    console.log('Token cleared successfully')
  } catch (error) {
    console.error('Error clearing token:', error)
  }
}

/**
 * Verificar se há uma sessão válida
 */
export function hasValidSession(): boolean {
  return getValidToken() !== null
}

/**
 * Refresh token (renovar timestamp)
 */
export function refreshToken(): boolean {
  try {
    const currentToken = getValidToken()
    if (!currentToken) {
      return false
    }

    // Renovar timestamp
    saveToken(currentToken)
    return true
  } catch (error) {
    console.error('Error refreshing token:', error)
    return false
  }
} 