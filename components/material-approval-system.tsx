"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Clock, Lock, Shield, AlertTriangle, Eye, FileText } from 'lucide-react'

interface MaterialSelection {
  id: number
  quantidade: number
  precoUnitario: number
  precoTotal: number
  observacoes?: string
  estado: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'EM_REVISAO' | 'BLOQUEADO'
  dataSelecao: string
  dataAprovacao?: string
  aprovadoPor?: string
  motivoRejeicao?: string
  zona: {
    id: number
    nome: string
    edificio: {
      nome: string
      cliente: {
        nome: string
      }
    }
  }
  material: {
    id: number
    nome: string
    marca?: string
    referencia?: string
    precoUnitario: number
    tipoMaterial: {
      nome: string
      categoria: string
      unidadeMedida: string
    }
  }
}

interface MaterialApprovalSystemProps {
  userRole: string
  userEmail?: string
  clienteId?: number
}

const ESTADO_CONFIG = {
  PENDENTE: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Aguarda aprovação do gabinete'
  },
  APROVADO: {
    label: 'Aprovado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Aprovado pelo gabinete de arquitetura'
  },
  REJEITADO: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Rejeitado pelo gabinete'
  },
  EM_REVISAO: {
    label: 'Em Revisão',
    color: 'bg-blue-100 text-blue-800',
    icon: Eye,
    description: 'Em análise pelo gabinete'
  },
  BLOQUEADO: {
    label: 'Bloqueado',
    color: 'bg-gray-100 text-gray-800',
    icon: Lock,
    description: 'Bloqueado para alterações'
  }
}

export function MaterialApprovalSystem({ userRole, userEmail, clienteId }: MaterialApprovalSystemProps) {
  const [selections, setSelections] = useState<MaterialSelection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSelection, setSelectedSelection] = useState<MaterialSelection | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const { toast } = useToast()

  // Verificar se o utilizador pode gerir aprovações
  const canManageApprovals = ['super_admin', 'admin'].includes(userRole)

  // Carregar seleções de materiais
  const loadSelections = async () => {
    try {
      setIsLoading(true)
      const url = clienteId 
        ? `/api/material-selections?clienteId=${clienteId}`
        : '/api/material-selections'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setSelections(data)
      } else {
        throw new Error('Erro ao carregar seleções')
      }
    } catch (error) {
      console.error('Erro ao carregar seleções:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as seleções de materiais",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSelections()
  }, [clienteId])

  // Aprovar seleção
  const approveSelection = async (selectionId: number) => {
    try {
      const response = await fetch(`/api/material-selections/${selectionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aprovadoPor: userEmail
        })
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Seleção aprovada com sucesso",
        })
        await loadSelections()
      } else {
        throw new Error('Erro ao aprovar seleção')
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a seleção",
        variant: "destructive"
      })
    }
  }

  // Rejeitar seleção
  const rejectSelection = async (selectionId: number, motivo: string) => {
    try {
      const response = await fetch(`/api/material-selections/${selectionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivoRejeicao: motivo,
          aprovadoPor: userEmail
        })
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Seleção rejeitada",
        })
        await loadSelections()
        setSelectedSelection(null)
        setRejectReason('')
      } else {
        throw new Error('Erro ao rejeitar seleção')
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a seleção",
        variant: "destructive"
      })
    }
  }

  // Filtrar seleções
  const filteredSelections = selections.filter(selection => {
    if (filterStatus === 'all') return true
    return selection.estado === filterStatus
  })

  // Estatísticas
  const stats = {
    total: selections.length,
    pendentes: selections.filter(s => s.estado === 'PENDENTE').length,
    aprovadas: selections.filter(s => s.estado === 'APROVADO').length,
    rejeitadas: selections.filter(s => s.estado === 'REJEITADO').length
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">A carregar seleções...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Sistema de Aprovação de Materiais
          </h2>
          <p className="text-gray-600">
            {canManageApprovals 
              ? 'Gerir aprovações de seleções de materiais dos clientes'
              : 'Estado das suas seleções de materiais'
            }
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Seleções</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.aprovadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejeitadas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          Todas ({stats.total})
        </Button>
        <Button
          variant={filterStatus === 'PENDENTE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('PENDENTE')}
        >
          Pendentes ({stats.pendentes})
        </Button>
        <Button
          variant={filterStatus === 'APROVADO' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('APROVADO')}
        >
          Aprovadas ({stats.aprovadas})
        </Button>
        <Button
          variant={filterStatus === 'REJEITADO' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('REJEITADO')}
        >
          Rejeitadas ({stats.rejeitadas})
        </Button>
      </div>

      {/* Lista de Seleções */}
      <div className="space-y-4">
        {filteredSelections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma seleção encontrada para os filtros selecionados</p>
            </CardContent>
          </Card>
        ) : (
          filteredSelections.map((selection) => {
            const estadoConfig = ESTADO_CONFIG[selection.estado]
            const IconComponent = estadoConfig.icon

            return (
              <Card key={selection.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{selection.material.nome}</CardTitle>
                      <CardDescription>
                        <span className="font-medium">{selection.zona.nome}</span> • {selection.zona.edificio.nome} • {selection.zona.edificio.cliente.nome}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Quantidade: {selection.quantidade} {selection.material.tipoMaterial.unidadeMedida}</span>
                        <span>Preço: €{selection.precoUnitario.toFixed(2)}</span>
                        <span className="font-medium">Total: €{selection.precoTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Badge className={estadoConfig.color}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {estadoConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Detalhes do Material */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {selection.material.marca && (
                        <div>
                          <span className="text-gray-600">Marca:</span>
                          <p className="font-medium">{selection.material.marca}</p>
                        </div>
                      )}
                      {selection.material.referencia && (
                        <div>
                          <span className="text-gray-600">Referência:</span>
                          <p className="font-medium">{selection.material.referencia}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Categoria:</span>
                        <p className="font-medium">{selection.material.tipoMaterial.categoria}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Data de Seleção:</span>
                        <p className="font-medium">{new Date(selection.dataSelecao).toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>

                    {/* Observações */}
                    {selection.observacoes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Observações:</span>
                        <p className="text-sm mt-1">{selection.observacoes}</p>
                      </div>
                    )}

                    {/* Informações de Aprovação/Rejeição */}
                    {selection.dataAprovacao && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm">
                          <span className="text-gray-600">
                            {selection.estado === 'APROVADO' ? 'Aprovado' : 'Rejeitado'} em:
                          </span>
                          <span className="font-medium ml-1">
                            {new Date(selection.dataAprovacao).toLocaleDateString('pt-PT')}
                          </span>
                          {selection.aprovadoPor && (
                            <>
                              <span className="text-gray-600 ml-3">por:</span>
                              <span className="font-medium ml-1">{selection.aprovadoPor}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Motivo de Rejeição */}
                    {selection.motivoRejeicao && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-red-800">Motivo da Rejeição:</span>
                            <p className="text-sm text-red-700 mt-1">{selection.motivoRejeicao}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ações para Administradores */}
                    {canManageApprovals && selection.estado === 'PENDENTE' && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => approveSelection(selection.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedSelection(selection)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeitar Seleção</DialogTitle>
                              <DialogDescription>
                                Indique o motivo da rejeição para {selection.material.nome}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="motivo">Motivo da Rejeição *</Label>
                                <Textarea
                                  id="motivo"
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder="Explique por que esta seleção foi rejeitada..."
                                  rows={3}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSelection(null)
                                    setRejectReason('')
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => rejectSelection(selection.id, rejectReason)}
                                  disabled={!rejectReason.trim()}
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
} 