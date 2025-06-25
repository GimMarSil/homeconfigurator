"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getValidToken, saveToken, clearToken, refreshToken } from "@/lib/token-utils"
import { PageLoading } from "@/components/loading"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "gestor" | "visualizador" | "super_admin"
  clienteId?: number
  clienteNome?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Verificar se o utilizador está autenticado
  const checkAuth = () => {
    return user !== null
  }

  // Função para fazer logout automático em caso de erro de autenticação
  const handleAuthError = () => {
    console.warn('Sessão inválida detectada. A fazer logout automático...')
    logout()
    // Redirecionar para página de login após um pequeno delay
    setTimeout(() => {
      router.push('/login')
    }, 100)
  }

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Só executar no cliente
    if (!isClient) return

    // Verificar se há um utilizador logado com token válido
    try {
      const validUser = getValidToken()
      if (validUser) {
        setUser(validUser)
        // Renovar token para estender a sessão
        refreshToken()
      }
    } catch (error) {
      console.error('Erro ao carregar dados do utilizador:', error)
      clearToken()
    } finally {
      setIsLoading(false)
    }
  }, [isClient])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Login response status:', response.status)
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('Login response data:', data)

      if (response.ok && data.success) {
        console.log('Login successful, validating user data:', data.user)
        
        // Validar dados do utilizador recebidos
        if (!data.user || data.user.id === undefined || data.user.id === null || !data.user.email || !data.user.role) {
          console.error('Dados de utilizador inválidos recebidos do servidor')
          console.error('User data received:', data.user)
          console.error('Missing fields:', {
            hasUser: !!data.user,
            hasId: data.user?.id !== undefined && data.user?.id !== null,
            hasEmail: !!data.user?.email,
            hasRole: !!data.user?.role,
            userObject: data.user
          })
          return false
        }

        console.log('User data validation passed, setting user')
        setUser(data.user)
        
        // Salvar token com timestamp
        saveToken(data.user)
        
        return true
      }

      console.error('Erro no login:', data.error)
      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    clearToken()
  }

  // Renderizar loading enquanto não estiver no cliente
  if (!isClient) {
    return <PageLoading />
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isLoading, 
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook para componentes que requerem autenticação
export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  return { user, isLoading }
}
