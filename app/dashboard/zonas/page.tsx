"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useApiData } from '@/hooks/use-api-data'
import { Pencil, Trash2, Plus, Home, Building, Package } from 'lucide-react'
import Link from 'next/link'

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'PENDENTE': return 'bg-yellow-100 text-yellow-800'
    case 'EM_PROGRESSO': return 'bg-blue-100 text-blue-800'
    case 'CONCLUIDO': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case 'PENDENTE': return 'Pendente'
    case 'EM_PROGRESSO': return 'Em Progresso'
    case 'CONCLUIDO': return 'Concluído'
    default: return estado
  }
}

interface FormData {
  nome: string
  area: string
  estado: string
  zonaTipoId: string
  edificioId: string
}

const initialFormData: FormData = {
  nome: '',
  area: '',
  estado: 'PENDENTE',
  zonaTipoId: '',
  edificioId: '',
}

export default function ZonasPage() {
  const {
    zonas,
    edificios,
    zonasTipo,
    isLoading,
    addZona,
    updateZona,
    deleteZona,
  } = useApiData()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingZona, setEditingZona] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.area || !formData.edificioId || !formData.zonaTipoId) {
      return
    }

    setIsSubmitting(true)
    try {
      const zonaData = {
        nome: formData.nome,
        area: parseFloat(formData.area),
        estado: formData.estado,
        edificioId: parseInt(formData.edificioId),
        zonaTipoId: parseInt(formData.zonaTipoId),
      }

      if (editingZona) {
        await updateZona(editingZona.id, zonaData)
      } else {
        await addZona(zonaData)
      }

      setFormData(initialFormData)
      setDialogOpen(false)
      setEditingZona(null)
    } catch (error) {
      console.error('Erro ao salvar zona:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (zona: any) => {
    setEditingZona(zona)
    setFormData({
      nome: zona.nome,
      area: zona.area.toString(),
      estado: zona.estado,
      zonaTipoId: zona.zonaTipoId.toString(),
      edificioId: zona.edificioId.toString(),
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteZona(id)
    } catch (error) {
      console.error('Erro ao eliminar zona:', error)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingZona(null)
      setFormData(initialFormData)
    }
  }

  // Estatísticas
  const stats = {
    total: zonas.length,
    pendentes: zonas.filter(z => z.estado === 'PENDENTE').length,
    emProgresso: zonas.filter(z => z.estado === 'EM_PROGRESSO').length,
    concluidas: zonas.filter(z => z.estado === 'CONCLUIDO').length,
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Zonas</h1>
          <p className="text-gray-600">Gerir zonas dos edifícios</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Zona
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingZona ? 'Editar Zona' : 'Nova Zona'}
              </DialogTitle>
              <DialogDescription>
                {editingZona 
                  ? 'Altere os dados da zona.'
                  : 'Preencha os dados para criar uma nova zona.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Zona</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Sala de Estar"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edificioId">Edifício</Label>
                <Select 
                  value={formData.edificioId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, edificioId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um edifício" />
                  </SelectTrigger>
                  <SelectContent>
                    {edificios.map((edificio) => (
                      <SelectItem key={edificio.id} value={edificio.id.toString()}>
                        {edificio.nome} - {edificio.cliente?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zonaTipoId">Tipo de Zona</Label>
                <Select 
                  value={formData.zonaTipoId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, zonaTipoId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {zonasTipo.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome} ({tipo.categoria})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="EM_PROGRESSO">Em Progresso</SelectItem>
                    <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'A guardar...' : editingZona ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Zonas</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emProgresso}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Zonas */}
      <div className="space-y-4">
        {zonas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Home className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma zona encontrada</h3>
              <p className="text-gray-600 text-center mb-6">
                Comece por criar a primeira zona para um dos seus edifícios.
              </p>
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Zona
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          zonas.map((zona) => (
            <Card key={zona.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{zona.nome}</h3>
                      <Badge className={getEstadoColor(zona.estado)}>
                        {getEstadoLabel(zona.estado)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>
                          {zona.edificio?.nome} - {zona.edificio?.cliente?.nome}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Área:</span> {zona.area} m²
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span> {zona.zonaTipo?.nome}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/zonas/${zona.id}/materiais`}>
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4 mr-1" />
                        Materiais
                      </Button>
                    </Link>
                    
                    <Link href={`/dashboard/zonas/${zona.id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-1" />
                        Ver Zona
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(zona)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar zona</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem a certeza que deseja eliminar a zona "{zona.nome}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(zona.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
