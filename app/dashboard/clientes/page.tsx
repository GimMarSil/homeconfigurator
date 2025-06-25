"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, Users, Building2, Edit } from "lucide-react"
import Link from "next/link"
import { useApiData } from "@/hooks/use-api-data"

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    morada: "",
    nif: "",
    status: "ATIVO" as "ATIVO" | "INATIVO",
  })

  const { 
    clientes, 
    addCliente, 
    updateCliente,
    deleteCliente, 
    getUtilizadoresByClienteId, 
    getEdificiosByClienteId, 
    isLoaded, 
    error 
  } = useApiData()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">A carregar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      morada: "",
      nif: "",
      status: "ATIVO",
    })
    setEditingCliente(null)
  }

  const openEditModal = (cliente: any) => {
    setEditingCliente(cliente)
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone || "",
      morada: cliente.morada || "",
      nif: cliente.nif || "",
      status: cliente.status,
    })
    setShowEditModal(true)
  }

  const handleAddCliente = async () => {
    if (formData.nome.trim() && formData.email.trim()) {
      try {
        await addCliente({
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          telefone: formData.telefone.trim() || undefined,
          morada: formData.morada.trim() || undefined,
          nif: formData.nif.trim() || undefined,
          status: formData.status,
        })
        resetForm()
        setShowAddModal(false)
      } catch (error) {
        console.error('Erro ao adicionar cliente:', error)
        // Aqui poderíamos mostrar uma notificação de erro
      }
    }
  }

  const handleEditCliente = async () => {
    if (!editingCliente || !formData.nome.trim() || !formData.email.trim()) return

    try {
      await updateCliente(editingCliente.id, {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || undefined,
        morada: formData.morada.trim() || undefined,
        nif: formData.nif.trim() || undefined,
        status: formData.status,
      })
      resetForm()
      setShowEditModal(false)
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
    }
  }

  const handleDeleteCliente = async (id: number) => {
    try {
      await deleteCliente(id)
      setShowDeleteDialog(null)
    } catch (error) {
      console.error('Erro ao eliminar cliente:', error)
      // Aqui poderíamos mostrar uma notificação de erro
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
          <p className="text-gray-600">Gerir clientes e respetivos projetos</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+351 912 345 678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="morada">Morada</Label>
                <Input
                  id="morada"
                  value={formData.morada}
                  onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                  placeholder="Morada completa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "ATIVO" | "INATIVO") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="INATIVO">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddCliente}>Guardar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClientes.map((cliente) => {
              const utilizadores = typeof getUtilizadoresByClienteId === 'function' 
                ? getUtilizadoresByClienteId(cliente.id) || []
                : []
              
              const edificios = typeof getEdificiosByClienteId === 'function' 
                ? getEdificiosByClienteId(cliente.id) || []
                : []

              return (
                <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                          <p className="text-sm text-gray-600">{cliente.email}</p>
                          <p className="text-sm text-gray-600">{cliente.telefone}</p>
                        </div>
                        <Badge variant={cliente.status === "ATIVO" ? "default" : "secondary"}>{cliente.status}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          <span>{edificios.length} edifícios</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{utilizadores.length} utilizadores</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/dashboard/clientes/${cliente.id}`}>Ver Detalhes</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(cliente)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar Cliente"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => window.open(`/dashboard/clientes/${cliente.id}`, '_blank')}
                          title="Gerir Utilizadores e Projetos"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setShowDeleteDialog(cliente.id)}
                          title="Eliminar Cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {clientes.length === 0
                  ? "Nenhum cliente encontrado. Adicione o primeiro cliente."
                  : "Nenhum cliente corresponde à pesquisa."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de eliminação */}
      <Dialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
          </DialogHeader>
          <p>
            Tem a certeza que deseja eliminar este cliente? Esta ação não pode ser desfeita e eliminará todos os
            projetos e utilizadores associados.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => showDeleteDialog && handleDeleteCliente(showDeleteDialog)}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input
                id="edit-telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="+351 912 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-morada">Morada</Label>
              <Input
                id="edit-morada"
                value={formData.morada}
                onChange={(e) => setFormData({ ...formData, morada: e.target.value })}
                placeholder="Morada completa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nif">NIF</Label>
              <Input
                id="edit-nif"
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ATIVO" | "INATIVO") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INATIVO">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditCliente}>Atualizar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
