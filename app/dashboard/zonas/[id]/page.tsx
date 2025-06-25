"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { FileUpload } from '@/components/file-upload'
import { useApiData } from '@/hooks/use-api-data'
import { ArrowLeft, Edit, Package, Euro, Palette, Building, Home, Users, Calendar, Settings, Upload, MapPin, Plus, Ruler } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FileManager } from '@/components/file-manager'

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

interface ZonaDetalhada {
  id: number
  nome: string
  area: number
  estado: string
  zonaTipo: {
    id: number
    nome: string
    categoria: string
    descricao?: string
  }
  edificio: {
    id: number
    nome: string
    cliente: {
      id: number
      nome: string
      email: string
    }
  }
  materiaisSelecionados: Array<{
    id: number
    quantidade: number
    precoUnitario: number
    observacoes?: string
    material: {
      id: number
      nome: string
      marca?: string
      tipoMaterial: {
        nome: string
        categoria: string
        unidadeMedida: string
      }
    }
  }>
}

export default function ZonaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const zonaId = parseInt(params.id as string)

  const {
    updateZona,
    zonasTipo,
    fetchZonaMateriais,
  } = useApiData()

  const [zona, setZona] = useState<ZonaDetalhada | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    area: '',
    estado: '',
    zonaTipoId: '',
  })
  const { toast } = useToast()

  // Carregar dados da zona
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchZonaMateriais(zonaId)
        setZona(data.zona)
        setFormData({
          nome: data.zona.nome,
          area: data.zona.area.toString(),
          estado: data.zona.estado,
          zonaTipoId: data.zona.zonaTipo.id.toString(),
        })
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError('Erro ao carregar dados da zona')
      } finally {
        setIsLoading(false)
      }
    }

    if (zonaId) {
      loadData()
    }
  }, [zonaId, fetchZonaMateriais])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.area) {
      return
    }

    try {
      const updateData = {
        nome: formData.nome,
        area: parseFloat(formData.area),
        estado: formData.estado,
        zonaTipoId: parseInt(formData.zonaTipoId),
      }

      await updateZona(zonaId, updateData)
      
      // Recarregar dados
      const updatedData = await fetchZonaMateriais(zonaId)
      setZona(updatedData.zona)
      
      setShowEditModal(false)
    } catch (error) {
      console.error('Erro ao atualizar zona:', error)
    }
  }

  const calculateTotalCost = () => {
    if (!zona) return 0
    return zona.materiaisSelecionados.reduce((total, ms) => {
      return total + (ms.quantidade * ms.precoUnitario)
    }, 0)
  }

  const getCostPerSquareMeter = () => {
    if (!zona || zona.area === 0) return 0
    return calculateTotalCost() / zona.area
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !zona) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Zona não encontrada'}
          </h3>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  // Se zona não existe, não renderizar o breadcrumb ainda
  if (!zona || !zona.edificio || !zona.edificio.cliente) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">A carregar zona...</p>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Clientes', href: '/dashboard/clientes' },
    { label: zona.edificio.cliente.nome, href: `/dashboard/clientes/${zona.edificio.cliente.id}` },
    { label: zona.edificio.nome, href: `/dashboard/edificios/${zona.edificio.id}` },
    { label: 'Zonas', href: '/dashboard/zonas' },
    { label: zona.nome, href: '' },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{zona.nome}</h1>
            <Badge className={getEstadoColor(zona.estado)}>
              {getEstadoLabel(zona.estado)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              <strong>Edifício:</strong> {zona.edificio.nome}
            </span>
            <span>
              <strong>Cliente:</strong> {zona.edificio.cliente.nome}
            </span>
            <span>
              <strong>Tipo:</strong> {zona.zonaTipo.nome}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Zona</DialogTitle>
                <DialogDescription>
                  Altere os dados da zona conforme necessário.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleUpdate} className="space-y-4">
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
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zonaTipoId">Tipo de Zona</Label>
                  <Select 
                    value={formData.zonaTipoId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, zonaTipoId: value }))}
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
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Atualizar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs Principais */}
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="ficheiros">Ficheiros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-6">
          {/* Informações da Zona */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informações da Zona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg">{zona.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p>{zona.zonaTipo.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Área</label>
                  <p className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    {zona.area ? `${zona.area} m²` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="text-muted-foreground">
                    {zona.zonaTipo.descricao || 'Sem descrição'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(zona.edificio.criadoEm)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Edifício e Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Edifício:</span>
                  <Link 
                    href={`/dashboard/edificios/${zona.edificio.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {zona.edificio.nome}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <Link 
                    href={`/dashboard/clientes/${zona.edificio.cliente.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {zona.edificio.cliente.nome}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email do Cliente:</span>
                  <span className="font-medium">{zona.edificio.cliente.email}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materiais" className="space-y-6">
          {/* Estatísticas de Materiais */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materiais Selecionados</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{zona.materiaisSelecionados.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{calculateTotalCost().toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo por m²</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{getCostPerSquareMeter().toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Materiais Selecionados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Materiais Selecionados</CardTitle>
                <CardDescription>
                  Materiais escolhidos para esta zona
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/dashboard/zonas/${zona.id}/materiais`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Materiais
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {zona.materiaisSelecionados.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum material selecionado</h3>
                  <p className="text-gray-600 mb-4">
                    Adicione materiais a esta zona para começar a planear o acabamento.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/zonas/${zona.id}/materiais`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Selecionar Materiais
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {zona.materiaisSelecionados.map((materialSelecionado) => (
                    <div key={materialSelecionado.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{materialSelecionado.material.nome}</h4>
                        <p className="text-sm text-gray-600">
                          {materialSelecionado.material.marca} - {materialSelecionado.material.tipoMaterial.nome}
                        </p>
                        {materialSelecionado.observacoes && (
                          <p className="text-sm text-gray-500 mt-1">{materialSelecionado.observacoes}</p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm text-gray-600">
                          {materialSelecionado.quantidade} {materialSelecionado.material.tipoMaterial.unidadeMedida}
                        </div>
                        <div className="text-sm text-gray-600">
                          €{materialSelecionado.precoUnitario.toFixed(2)}/{materialSelecionado.material.tipoMaterial.unidadeMedida}
                        </div>
                        <div className="font-medium text-blue-600">
                          €{(materialSelecionado.quantidade * materialSelecionado.precoUnitario).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total da Zona:</span>
                      <span className="text-green-600">€{calculateTotalCost().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                      <span>Custo por m²:</span>
                      <span>€{getCostPerSquareMeter().toFixed(2)}/m²</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ficheiros" className="space-y-6">
          <FileManager
            zonaId={zona.id}
            showUpload={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
