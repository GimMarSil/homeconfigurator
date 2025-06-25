"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useAuthDebug, debugAuthInfo } from '@/lib/auth-debug'
import { ProtectedRoute } from '@/components/protected-route'

export default function AuthDebugPage() {
  const { user } = useAuth()
  const { logs, summary, issues, clearLogs } = useAuthDebug()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Refrescar a cada 5 segundos
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleClearLogs = () => {
    clearLogs()
    setRefreshKey(prev => prev + 1)
  }

  const handleDebugInfo = () => {
    debugAuthInfo()
  }

  const handleTestApiCall = async () => {
    try {
      const response = await fetch('/api/clientes')
      const data = await response.json()
      console.log('Test API call result:', { status: response.status, data })
    } catch (error) {
      console.error('Test API call error:', error)
    }
  }

  return (
    <ProtectedRoute requireSuperAdmin>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Debug de Autenticação</h1>
          <p className="text-gray-600">
            Informações de debug para resolução de problemas de autenticação
          </p>
        </div>

        {/* Utilizador Atual */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Utilizador Atual</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>

        {/* Resumo de Autenticação */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Resumo de Autenticação</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-900">Total de Logs</h3>
              <p className="text-2xl font-bold text-blue-600">{summary.totalLogs}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium text-green-900">Autenticações Bem-Sucedidas</h3>
              <p className="text-2xl font-bold text-green-600">{summary.recentSuccessfulAuths}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-md">
              <h3 className="font-medium text-red-900">Erros Recentes</h3>
              <p className="text-2xl font-bold text-red-600">{summary.recentErrors}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Métodos de Autenticação (últimos 10)</h3>
            <div className="flex gap-4 text-sm">
              <span>Bearer: {summary.authMethods.bearer}</span>
              <span>Cookie: {summary.authMethods.cookie}</span>
              <span>Nenhum: {summary.authMethods.none}</span>
            </div>
          </div>

          {summary.lastError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <h3 className="font-medium text-red-900">Último Erro</h3>
              <p className="text-red-700">{summary.lastError}</p>
            </div>
          )}
        </div>

        {/* Issues Detectados */}
        {issues.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600">⚠️ Issues Detectados</h2>
            <ul className="space-y-2">
              {issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-red-700">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ações */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Ações de Debug</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleTestApiCall}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Testar Chamada à API
            </button>
            <button
              onClick={handleDebugInfo}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Mostrar Debug no Console
            </button>
            <button
              onClick={handleClearLogs}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Limpar Logs
            </button>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Refrescar
            </button>
          </div>
        </div>

        {/* Logs de Autenticação */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Logs de Autenticação ({logs.length})
          </h2>
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum log disponível</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border ${
                      log.errorMessage
                        ? 'bg-red-50 border-red-200'
                        : log.tokenValid
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">
                        {new Date(log.timestamp).toLocaleString('pt-PT')}
                      </span>
                      <div className="flex gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          log.authMethod === 'bearer' ? 'bg-blue-100 text-blue-800' :
                          log.authMethod === 'cookie' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.authMethod}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          log.tokenValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.tokenValid ? 'Válido' : 'Inválido'}
                        </span>
                      </div>
                    </div>
                    
                    {log.user && (
                      <div className="text-sm text-gray-600 mb-1">
                        User: {log.user.email} ({log.user.role})
                      </div>
                    )}
                    
                    {log.errorMessage && (
                      <div className="text-sm text-red-600">
                        Erro: {log.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 