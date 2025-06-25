// Utilitários para debug de autenticação

export interface AuthDebugInfo {
  timestamp: string
  user: any
  authMethod: 'bearer' | 'cookie' | 'none'
  tokenPresent: boolean
  tokenValid: boolean
  errorMessage?: string
}

export class AuthDebugger {
  private static logs: AuthDebugInfo[] = []
  private static maxLogs = 50

  static log(info: Partial<AuthDebugInfo>) {
    const debugInfo: AuthDebugInfo = {
      timestamp: new Date().toISOString(),
      user: info.user || null,
      authMethod: info.authMethod || 'none',
      tokenPresent: info.tokenPresent || false,
      tokenValid: info.tokenValid || false,
      errorMessage: info.errorMessage
    }

    this.logs.unshift(debugInfo)
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Log no console em modo desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Auth Debug:', debugInfo)
    }
  }

  static getLogs(): AuthDebugInfo[] {
    return [...this.logs]
  }

  static clearLogs(): void {
    this.logs = []
  }

  static getAuthSummary() {
    const recentLogs = this.logs.slice(0, 10)
    const errors = recentLogs.filter(log => log.errorMessage)
    const successfulAuths = recentLogs.filter(log => log.tokenValid)

    return {
      totalLogs: this.logs.length,
      recentErrors: errors.length,
      recentSuccessfulAuths: successfulAuths.length,
      lastError: errors[0]?.errorMessage || null,
      authMethods: {
        bearer: recentLogs.filter(log => log.authMethod === 'bearer').length,
        cookie: recentLogs.filter(log => log.authMethod === 'cookie').length,
        none: recentLogs.filter(log => log.authMethod === 'none').length
      }
    }
  }

  // Verificar se há padrões de erro
  static detectIssues() {
    const recentLogs = this.logs.slice(0, 20)
    const issues: string[] = []

    // Muitos erros de token inválido
    const invalidTokens = recentLogs.filter(log => 
      log.errorMessage?.includes('Token inválido') || 
      log.errorMessage?.includes('Dados de utilizador inválidos')
    ).length

    if (invalidTokens > 5) {
      issues.push(`Muitos tokens inválidos detectados (${invalidTokens} nos últimos 20 logs)`)
    }

    // Falta de autenticação consistente
    const noAuthMethods = recentLogs.filter(log => log.authMethod === 'none').length
    if (noAuthMethods > 10) {
      issues.push(`Muitas tentativas sem método de autenticação (${noAuthMethods} nos últimos 20 logs)`)
    }

    // Problemas de parsing
    const parseErrors = recentLogs.filter(log => 
      log.errorMessage?.includes('parse') || 
      log.errorMessage?.includes('formato incorreto')
    ).length

    if (parseErrors > 3) {
      issues.push(`Problemas de parsing de token detectados (${parseErrors} nos últimos 20 logs)`)
    }

    return issues
  }
}

// Hook para usar o debugger em componentes React
export function useAuthDebug() {
  const logs = AuthDebugger.getLogs()
  const summary = AuthDebugger.getAuthSummary()
  const issues = AuthDebugger.detectIssues()

  return {
    logs,
    summary,
    issues,
    clearLogs: AuthDebugger.clearLogs
  }
}

// Função para exibir informações de debug no console
export function debugAuthInfo() {
  const summary = AuthDebugger.getAuthSummary()
  const issues = AuthDebugger.detectIssues()

  console.group('🔐 Authentication Debug Summary')
  console.log('Summary:', summary)
  if (issues.length > 0) {
    console.warn('Issues detected:', issues)
  } else {
    console.log('✅ No issues detected')
  }
  console.groupEnd()

  return { summary, issues }
} 