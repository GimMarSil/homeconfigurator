"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useApiData } from '@/hooks/use-api-data'
import { ArrowLeft, Plus, Trash2, Edit, Package, ShoppingCart, Euro, Eye, Palette, Users, GitCompare, Search, Filter } from 'lucide-react'
import { MaterialGallery } from '@/components/material-gallery'
import { useToast } from '@/components/ui/use-toast'
import { Loading } from '@/components/loading'

interface ZonaMaterialData {
  zona: {
    id: number
    nome: string
    area: number
    estado: string
    zonaTipo: {
      id: number
      nome: string
      categoria: string
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
  }
  materiaisSelecionados: Array<{
    id: number
    quantidade: number
    precoUnitario: number
    observacoes?: string
    material: {
      id: number
      nome: string
      referencia?: string
      marca?: string
      descricao?: string
      precoUnitario: number
      fornecedor?: string
      imagem?: string
      fichaTecnica?: string
      disponivel: boolean
      tipoMaterial: {
        nome: string
        categoria: string
        unidadeMedida: string
      }
    }
  }>
  materiaisDisponiveis: Array<{
    id: number
    nome: string
    referencia?: string
    marca?: string
    descricao?: string
    precoUnitario: number
    fornecedor?: string
    imagem?: string
    fichaTecnica?: string
    disponivel: boolean
    tipoMaterial: {
      nome: string
      categoria: string
      unidadeMedida: string
    }
  }>
}

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

export default function ZonaMateriaisPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const zonaId = parseInt(params.id as string)

  const {
    addMaterialToZona,
    updateMaterialSelecionado,
    removeMaterialFromZona,
    fetchZonaMateriais,
  } = useApiData()

  const [zonaMateriais, setZonaMateriais] = useState<ZonaMaterialData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([])
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<any>(null)
  const [formData, setFormData] = useState({
    materialId: '',
    quantidade: '1',
    precoUnitario: '',
    observacoes: '',
  })
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null)

  // Carregar dados da zona e materiais
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchZonaMateriais(zonaId)
        setZonaMateriais(data)
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

  useEffect(() => {
    if (zonaMateriais) {
      filterMaterials()
    }
  }, [zonaMateriais, searchTerm, statusFilter])

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.materialId || !formData.quantidade) {
      return
    }

    try {
      const materialData = {
        materialId: parseInt(formData.materialId),
        quantidade: parseFloat(formData.quantidade),
        ...(formData.precoUnitario && { precoUnitario: parseFloat(formData.precoUnitario) }),
        ...(formData.observacoes && { observacoes: formData.observacoes }),
      }

      await addMaterialToZona(zonaId, materialData)
      
      // Recarregar dados
      const updatedData = await fetchZonaMateriais(zonaId)
      setZonaMateriais(updatedData)
      
      // Reset form
      setFormData({
        materialId: '',
        quantidade: '1',
        precoUnitario: '',
        observacoes: '',
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Erro ao adicionar material:', error)
    }
  }

  const handleEditMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingMaterial) return

    try {
      const updateData = {
        ...(formData.quantidade && { quantidade: parseFloat(formData.quantidade) }),
        ...(formData.precoUnitario && { precoUnitario: parseFloat(formData.precoUnitario) }),
        observacoes: formData.observacoes,
      }

      await updateMaterialSelecionado(editingMaterial.id, updateData)
      
      // Recarregar dados
      const updatedData = await fetchZonaMateriais(zonaId)
      setZonaMateriais(updatedData)
      
      setEditingMaterial(null)
      setFormData({
        materialId: '',
        quantidade: '1',
        precoUnitario: '',
        observacoes: '',
      })
    } catch (error) {
      console.error('Erro ao atualizar material:', error)
    }
  }

  const handleRemoveMaterial = async (materialSelecionadoId: number) => {
    try {
      await removeMaterialFromZona(materialSelecionadoId)
      
      // Recarregar dados
      const updatedData = await fetchZonaMateriais(zonaId)
      setZonaMateriais(updatedData)
    } catch (error) {
      console.error('Erro ao remover material:', error)
    }
  }

  const toggleMaterialSelection = (materialId: number) => {
    setSelectedMaterials(prev => 
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    )
  }

  const getSelectedMaterialsData = () => {
    if (!zonaMateriais) return []
    return zonaMateriais.materiaisSelecionados.filter(ms => 
      selectedMaterials.includes(ms.material.id)
    )
  }

  const startEdit = (materialSelecionado: any) => {
    setEditingMaterial(materialSelecionado)
    setFormData({
      materialId: materialSelecionado.material.id.toString(),
      quantidade: materialSelecionado.quantidade.toString(),
      precoUnitario: materialSelecionado.precoUnitario.toString(),
      observacoes: materialSelecionado.observacoes || '',
    })
  }

  const calculateTotalCost = () => {
    if (!zonaMateriais) return 0
    return zonaMateriais.materiaisSelecionados.reduce((total, ms) => {
      return total + (ms.quantidade * ms.precoUnitario)
    }, 0)
  }

  const filterMaterials = () => {
    if (!zonaMateriais) return

    let filtered = [...zonaMateriais.materiaisSelecionados]

    // Filtrar por termo de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(ms => 
        ms.material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ms.material.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ms.material.referencia?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ms => {
        switch (statusFilter) {
          case 'approved':
            return ms.material.disponivel
          case 'pending':
            return !ms.material.disponivel
          default:
            return true
        }
      })
    }

    setFilteredMaterials(filtered)
  }

  const handleApproveMaterial = async (materialId: number) => {
    try {
      // TODO: Implementar API de aprovação
      toast({
        title: "Sucesso",
        description: "Material aprovado com sucesso!",
      })
      fetchZonaMateriais(zonaId)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar material",
        variant: "destructive",
      })
    }
  }

  const handleRejectMaterial = async (materialId: number, reason: string) => {
    try {
      // TODO: Implementar API de rejeição
      toast({
        title: "Sucesso",
        description: "Material rejeitado",
      })
      fetchZonaMateriais(zonaId)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar material",
        variant: "destructive",
      })
    }
  }

  const handleCommentMaterial = async (materialId: number, comment: string) => {
    try {
      // TODO: Implementar API de comentários
      toast({
        title: "Sucesso",
        description: "Comentário adicionado",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar comentário",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (error || !zonaMateriais) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Clientes', href: '/dashboard/clientes' },
    { label: zonaMateriais.zona.edificio.cliente.nome, href: `/dashboard/clientes/${zonaMateriais.zona.edificio.cliente.id}` },
    { label: zonaMateriais.zona.edificio.nome, href: `/dashboard/edificios/${zonaMateriais.zona.edificio.id}` },
    { label: 'Zonas', href: '/dashboard/zonas' },
    { label: `${zonaMateriais.zona.nome} - Materiais`, href: '' },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{zonaMateriais.zona.nome}</h1>
            <Badge className={getEstadoColor(zonaMateriais.zona.estado)}>
              {getEstadoLabel(zonaMateriais.zona.estado)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              <strong>Edifício:</strong> {zonaMateriais.zona.edificio.nome}
            </span>
            <span>
              <strong>Cliente:</strong> {zonaMateriais.zona.edificio.cliente.nome}
            </span>
            <span>
              <strong>Área:</strong> {zonaMateriais.zona.area} m²
            </span>
            <span>
              <strong>Tipo:</strong> {zonaMateriais.zona.zonaTipo.nome}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Material à Zona</DialogTitle>
                <DialogDescription>
                  Selecione um material e defina a quantidade para esta zona.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="materialId">Material</Label>
                  <select 
                    id="materialId"
                    value={formData.materialId}
                    onChange={(e) => setFormData(prev => ({ ...prev, materialId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione um material</option>
                    {zonaMateriais.materiaisDisponiveis
                      .filter(material => !zonaMateriais.materiaisSelecionados.some(ms => ms.material.id === material.id))
                      .map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.nome} - {material.marca} ({material.tipoMaterial.nome})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="precoUnitario">Preço Unitário (€)</Label>
                    <Input
                      id="precoUnitario"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precoUnitario}
                      onChange={(e) => setFormData(prev => ({ ...prev, precoUnitario: e.target.value }))}
                      placeholder="Deixe vazio para usar preço padrão"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações opcionais sobre este material nesta zona"
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Adicionar Material
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Selecionados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{zonaMateriais.materiaisSelecionados.length}</div>
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
            <div className="text-2xl font-bold">
              €{zonaMateriais.zona.area > 0 ? (calculateTotalCost() / zonaMateriais.zona.area).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar materiais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os materiais</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materiais Selecionados */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Materiais Selecionados</h2>
          {selectedMaterials.length > 1 && (
            <Button onClick={() => setShowComparisonModal(true)}>
              <GitCompare className="h-4 w-4 mr-2" />
              Comparar Selecionados ({selectedMaterials.length})
            </Button>
          )}
        </div>

        {zonaMateriais.materiaisSelecionados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum material selecionado</h3>
              <p className="text-gray-600 text-center mb-6">
                Adicione materiais a esta zona para começar a planear o acabamento.
              </p>
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Material
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((materialSelecionado) => (
              <Card key={materialSelecionado.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(materialSelecionado.material.id)}
                      onChange={() => toggleMaterialSelection(materialSelecionado.material.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMaterial(materialSelecionado)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(materialSelecionado)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Remover">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover material</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem a certeza que deseja remover "{materialSelecionado.material.nome}" desta zona?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveMaterial(materialSelecionado.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{materialSelecionado.material.nome}</CardTitle>
                  <CardDescription>
                    {materialSelecionado.material.marca} - {materialSelecionado.material.tipoMaterial.nome}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Quantidade:</span>
                      <span>{materialSelecionado.quantidade} {materialSelecionado.material.tipoMaterial.unidadeMedida}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço unitário:</span>
                      <span>€{materialSelecionado.precoUnitario.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>€{(materialSelecionado.quantidade * materialSelecionado.precoUnitario).toFixed(2)}</span>
                    </div>
                    {materialSelecionado.observacoes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <strong>Observações:</strong> {materialSelecionado.observacoes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Comparação */}
      <Dialog open={showComparisonModal} onOpenChange={setShowComparisonModal}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparação de Materiais</DialogTitle>
            <DialogDescription>
              Comparar {selectedMaterials.length} materiais selecionados
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getSelectedMaterialsData().map((materialSelecionado) => (
              <Card key={materialSelecionado.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{materialSelecionado.material.nome}</CardTitle>
                  <CardDescription>{materialSelecionado.material.marca}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Tipo:</strong> {materialSelecionado.material.tipoMaterial.nome}</div>
                    <div><strong>Referência:</strong> {materialSelecionado.material.referencia || 'N/A'}</div>
                    <div><strong>Fornecedor:</strong> {materialSelecionado.material.fornecedor || 'N/A'}</div>
                    <div><strong>Quantidade:</strong> {materialSelecionado.quantidade} {materialSelecionado.material.tipoMaterial.unidadeMedida}</div>
                    <div><strong>Preço unitário:</strong> €{materialSelecionado.precoUnitario.toFixed(2)}</div>
                    <div className="font-medium"><strong>Total:</strong> €{(materialSelecionado.quantidade * materialSelecionado.precoUnitario).toFixed(2)}</div>
                    {materialSelecionado.material.descricao && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {materialSelecionado.material.descricao}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowComparisonModal(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editingMaterial !== null} onOpenChange={(open) => !open && setEditingMaterial(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
            <DialogDescription>
              Alterar quantidade, preço ou observações do material selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditMaterial} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantidade">Quantidade</Label>
                <Input
                  id="edit-quantidade"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-precoUnitario">Preço Unitário (€)</Label>
                <Input
                  id="edit-precoUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoUnitario}
                  onChange={(e) => setFormData(prev => ({ ...prev, precoUnitario: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-observacoes">Observações</Label>
              <Textarea
                id="edit-observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre este material nesta zona"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingMaterial(null)}>
                Cancelar
              </Button>
              <Button type="submit">
                Atualizar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Material */}
      <Dialog open={selectedMaterial !== null} onOpenChange={(open) => !open && setSelectedMaterial(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Material</DialogTitle>
          </DialogHeader>
                            {selectedMaterial && (
                    <MaterialGallery
                      material={selectedMaterial.material}
                      onApprove={handleApproveMaterial}
                      onReject={handleRejectMaterial}
                      onComment={handleCommentMaterial}
                      onFilesUpdated={() => {
                        // Recarregar dados quando ficheiros são atualizados
                        fetchZonaMateriais(zonaId)
                        setSelectedMaterial(null) // Fechar modal para mostrar mudanças
                      }}
                      canApprove={true}
                      canUpload={true}
                    />
                  )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
