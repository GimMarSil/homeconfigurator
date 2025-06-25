"use client"

import { useAuth } from '@/contexts/auth-context'
import { MaterialApprovalSystem } from '@/components/material-approval-system'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'

export default function ApprovalPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
            <p className="text-gray-600">É necessário estar autenticado para aceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Centro de Aprovações</h1>
        </div>
        <p className="text-gray-600">
          Gerir e monitorizar todas as seleções de materiais que requerem aprovação
        </p>
      </div>

      <MaterialApprovalSystem
        userRole={user.role}
        userEmail={user.email}
        clienteId={user.role === 'super_admin' || user.role === 'admin' ? undefined : user.clienteId}
      />
    </div>
  )
} 