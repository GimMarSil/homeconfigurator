"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSuperAdmin?: boolean
}

export function ProtectedRoute({ children, requireSuperAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('User not authenticated, redirecting to login')
        router.push("/login")
        return
      }

      // Verificar se requer super admin
      if (requireSuperAdmin && user.role !== 'super_admin') {
        setAuthError('Acesso restrito a super administradores')
        return
      }

      // Limpar erro se tudo estiver OK
      setAuthError(null)
    }
  }, [user, isLoading, router, requireSuperAdmin])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">A verificar autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">A redirecionar para o login...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook para usar em componentes que precisam verificar autenticação programaticamente
export function useProtectedAuth(requireSuperAdmin = false) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const isAuthenticated = !isLoading && user !== null
  const hasRequiredRole = !requireSuperAdmin || (user?.role === 'super_admin')
  const canAccess = isAuthenticated && hasRequiredRole

  const redirectToLogin = () => {
    router.push('/login')
  }

  const redirectToDashboard = () => {
    router.push('/dashboard')
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRequiredRole,
    canAccess,
    redirectToLogin,
    redirectToDashboard
  }
}
