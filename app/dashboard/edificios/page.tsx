"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useApiData } from "@/hooks/use-api-data"
import { Building, Home, Plus, Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EdificiosPage() {
  const { 
    edificios, 
    clientes, 
    isLoaded, 
    isLoading, 
    error,
    addEdificio, 
    updateEdificio, 
    deleteEdificio,
    getClienteById 
  } = useApiData()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClienteId, setSelectedClienteId] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEdificio, setEditingEdificio] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: "",
    morada: "",
    tipologia: "",
    nPisos: "",
    areaBruta: "",
    anoConstrucao: "",
    estado: "EM_CURSO" as const,
    clienteId: "",
  })

  // Estados dos edifícios
  const estadosEdificio = {
    EM_CURSO: { label: "Em Curso", color: "bg-blue-100 text-blue-800" },
    FINALIZADO: { label: "Finalizado", color: "bg-green-100 text-green-800" },
    PAUSADO: { label: "Pausado", color: "bg-yellow-100 text-yellow-800" },
  }

  // Filtrar edifícios
  const edificiosFiltrados = edificios.filter(edificio => {
    const matchesSearch = edificio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         edificio.morada.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCliente = selectedClienteId === "all" || edificio.clienteId === parseInt(selectedClienteId)
    return matchesSearch && matchesCliente
  })

  const resetForm = () => {
    setFormData({
      nome: "",
      morada: "",
      tipologia: "",
      nPisos: "",
      areaBruta: "",
      anoConstrucao: "",
      estado: "EM_CURSO",
      clienteId: "",
    })
    setEditingEdificio(null)
  }

  const openDialog = (edificio?: any) => {
    if (edificio) {
      setEditingEdificio(edificio)
      setFormData({
        nome: edificio.nome,
        morada: edificio.morada,
        tipologia: edificio.tipologia || "",
        nPisos: edificio.nPisos?.toString() || "",
        areaBruta: edificio.areaBruta?.toString() || "",
        anoConstrucao: edificio.anoConstrucao?.toString() || "",
        estado: edificio.estado,
        clienteId: edificio.clienteId.toString(),
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const edificioData = {
        ...formData,
        nPisos: formData.nPisos ? parseInt(formData.nPisos) : undefined,
        areaBruta: formData.areaBruta ? parseFloat(formData.areaBruta) : undefined,
        anoConstrucao: formData.anoConstrucao ? parseInt(formData.anoConstrucao) : undefined,
        clienteId: parseInt(formData.clienteId),
      }

      if (editingEdificio) {
        await updateEdificio(editingEdificio.id, edificioData)
      } else {
        await addEdificio(edificioData)
      }
      
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar edifício:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem a certeza que deseja eliminar este edifício?')) {
      try {
        await deleteEdificio(id)
      } catch (error) {
        console.error('Erro ao eliminar edifício:', error)
      }
    }
  }

  if (!isLoaded && isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Erro ao carregar dados: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edifícios</h1>
          <p className="text-gray-600">Gerir os edifícios dos seus clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Edifício
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEdificio ? 'Editar Edifício' : 'Novo Edifício'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="clienteId">Cliente *</Label>
                <Select
                  value={formData.clienteId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nome">Nome do Edifício *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="morada">Morada *</Label>
                <Input
                  id="morada"
                  value={formData.morada}
                  onChange={(e) => setFormData(prev => ({ ...prev, morada: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipologia">Tipologia</Label>
                <Input
                  id="tipologia"
                  value={formData.tipologia}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipologia: e.target.value }))}
                  placeholder="ex: T3, Vivenda, Escritório..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nPisos">Nº de Pisos</Label>
                  <Input
                    id="nPisos"
                    type="number"
                    min="1"
                    value={formData.nPisos}
                    onChange={(e) => setFormData(prev => ({ ...prev, nPisos: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="areaBruta">Área Bruta (m²)</Label>
                  <Input
                    id="areaBruta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.areaBruta}
                    onChange={(e) => setFormData(prev => ({ ...prev, areaBruta: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="anoConstrucao">Ano de Construção</Label>
                <Input
                  id="anoConstrucao"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.anoConstrucao}
                  onChange={(e) => setFormData(prev => ({ ...prev, anoConstrucao: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, estado: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EM_CURSO">Em Curso</SelectItem>
                    <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                    <SelectItem value="PAUSADO">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEdificio ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Edifícios</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{edificios.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Curso</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {edificios.filter(e => e.estado === "EM_CURSO").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <Home className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {edificios.filter(e => e.estado === "FINALIZADO").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pausados</CardTitle>
            <Home className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {edificios.filter(e => e.estado === "PAUSADO").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome ou morada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clientes.map(cliente => (
              <SelectItem key={cliente.id} value={cliente.id.toString()}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Edifícios</CardTitle>
          <CardDescription>
            {edificiosFiltrados.length} edifício{edificiosFiltrados.length !== 1 ? 's' : ''} encontrado{edificiosFiltrados.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Morada</TableHead>
                <TableHead>Tipologia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Área (m²)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {edificiosFiltrados.map((edificio) => {
                const cliente = getClienteById(edificio.clienteId)
                const estado = estadosEdificio[edificio.estado]
                
                return (
                  <TableRow key={edificio.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/dashboard/edificios/${edificio.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {edificio.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{cliente?.nome}</TableCell>
                    <TableCell className="max-w-xs truncate">{edificio.morada}</TableCell>
                    <TableCell>{edificio.tipologia || "-"}</TableCell>
                    <TableCell>
                      <Badge className={estado.color}>
                        {estado.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{edificio.areaBruta ? `${edificio.areaBruta}m²` : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(edificio)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(edificio.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {edificiosFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum edifício encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
