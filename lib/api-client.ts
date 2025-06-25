/**
 * Cliente API robusto com retry, timeout e tratamento de erros
 */

import { config, buildApiUrl } from './config'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface ApiRequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  skipAuth?: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Classe principal do cliente API
class ApiClient {
  private defaultOptions: ApiRequestOptions = {
    timeout: config.api.timeout,
    retries: config.api.retries,
    retryDelay: config.api.retryDelay,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  // Função para obter token de autenticação
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      
      const user = JSON.parse(userStr)
      return encodeURIComponent(JSON.stringify(user))
    } catch {
      return null
    }
  }

  // Função para adicionar headers de autenticação
  private addAuthHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getAuthToken()
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  // Função para fazer requisição com timeout
  private async fetchWithTimeout(
    url: string, 
    options: RequestInit, 
    timeoutMs: number
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new ApiError(
          `Timeout: A requisição demorou mais de ${timeoutMs}ms`,
          408,
          'TIMEOUT'
        )
      }
      
      throw error
    }
  }

  // Função principal para fazer requisições
  async request<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultOptions.timeout,
      retries = this.defaultOptions.retries,
      retryDelay = this.defaultOptions.retryDelay,
      skipAuth = false,
      ...requestOptions
    } = options

    const url = buildApiUrl(endpoint)
    
    // Preparar headers
    let headers = { ...this.defaultOptions.headers, ...requestOptions.headers }
    
    if (!skipAuth) {
      headers = this.addAuthHeaders(headers)
    }

    const finalOptions: RequestInit = {
      ...requestOptions,
      headers,
    }

    let lastError: any = null
    
    // Tentar a requisição com retry
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        if (config.debug.enabled) {
          console.log(`🌐 API Request (tentativa ${attempt}):`, {
            url,
            method: finalOptions.method || 'GET',
            headers: Object.keys(headers),
          })
        }

        const response = await this.fetchWithTimeout(url, finalOptions, timeout)
        
        // Tratar resposta
        if (response.ok) {
          const data = await response.json()
          
          if (config.debug.enabled) {
            console.log(`✅ API Success:`, { url, status: response.status })
          }
          
          return {
            data,
            success: true,
          }
        }
        
        // Erro HTTP
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: 'Erro desconhecido do servidor' }
        }
        
        const apiError = new ApiError(
          errorData.error || `Erro HTTP ${response.status}`,
          response.status,
          errorData.code,
          errorData
        )
        
        // Se for erro 401, não fazer retry
        if (response.status === 401) {
          if (config.debug.enabled) {
            console.log('🔐 Token inválido detectado, não vai fazer retry')
          }
          throw apiError
        }
        
        // Se for o último retry, lançar erro
        if (attempt > retries) {
          throw apiError
        }
        
        // Aguardar antes do próximo retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        lastError = apiError
        
        if (config.debug.enabled) {
          console.log(`⚠️ API Error (retry ${attempt}):`, {
            url,
            status: response.status,
            error: errorData.error,
          })
        }
        
      } catch (error) {
        lastError = error
        
        // Se for erro de rede ou timeout, tentar novamente
        if (error instanceof ApiError || error.name === 'TypeError') {
          if (attempt > retries) {
            break
          }
          
          if (config.debug.enabled) {
            console.log(`🔄 Retry ${attempt} devido a erro:`, error.message)
          }
          
          // Aguardar antes do próximo retry (aumentando o delay)
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          continue
        }
        
        // Outros erros, não fazer retry
        break
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    const finalError = lastError instanceof ApiError 
      ? lastError 
      : new ApiError(
          lastError?.message || 'Erro de conexão com o servidor',
          0,
          'NETWORK_ERROR',
          lastError
        )
    
    if (config.debug.enabled) {
      console.error('❌ API Failed after all retries:', finalError)
    }
    
    return {
      error: finalError.message,
      success: false,
    }
  }

  // Métodos de conveniência
  async get<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any, options?: Omit<ApiRequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Método para testar conectividade
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/api/health', { 
        skipAuth: true, 
        retries: 1,
        timeout: 5000 
      })
      return response.success
    } catch {
      return false
    }
  }
}

// Instância singleton
export const apiClient = new ApiClient()

// Hook para usar em componentes React
export function useApiClient() {
  return apiClient
} 