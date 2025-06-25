"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MapPin, Calendar, Users, Eye, Trash2, Copy, Edit, Mail, Phone, Hash, Building, EyeOff } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useApiData } from "@/hooks/use-api-data"

const tipologias = ["T0", "T1", "T2", "T3", "T4", "T5", "Moradia", "Apartamento", "Escritório", "Loja", "Armazém"]

export default function ClienteProjectsPage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = Number.parseInt(params.id as string)

  const {
    getClienteById,
    getEdificiosByClienteId,
    getUtilizadoresByClienteId,
    getZonasByEdificioId,
    updateCliente,
    addEdificio,
    updateEdificio,
    deleteEdificio,
    addUtilizador,
    updateUtilizador,
    deleteUtilizador,
    isLoaded,
    error
  } = useApiData()

  const cliente = typeof getClienteById === 'function' ? getClienteById(clienteId) : null
  const edificios = typeof getEdificiosByClienteId === 'function' ? getEdificiosByClienteId(clienteId) || [] : []
  const utilizadores = typeof getUtilizadoresByClienteId === 'function' ? getUtilizadoresByClienteId(clienteId) || [] : []

  const [showAddEdificioModal, setShowAddEdificioModal] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showEditClienteModal, setShowEditClienteModal] = useState(false)
  const [showDeleteEdificioDialog, setShowDeleteEdificioDialog] = useState<number | null>(null)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  const [edificioFormData, setEdificioFormData] = useState({
    nome: "",
    morada: "",
    tipologia: "",
    nPisos: 1,
    areaBruta: 0,
    anoConstrucao: new Date().getFullYear(),
    estado: "EM_CURSO" as "EM_CURSO" | "FINALIZADO" | "PAUSADO",
  })

  const [userFormData, setUserFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    password: "",
    role: "VISUALIZADOR" as "ADMIN" | "GESTOR" | "VISUALIZADOR",
    status: "ATIVO" as "ATIVO" | "INATIVO",
  })

  const [clienteFormData, setClienteFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    morada: "",
    nif: "",
    status: "ATIVO" as "ATIVO" | "INATIVO",
  })

  // Initialize cliente form data when cliente is loaded
  useEffect(() => {
    if (cliente) {
      setClienteFormData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone || "",
        morada: cliente.morada || "",
        nif: cliente.nif || "",
        status: cliente.status,
      })
    }
  }, [cliente])

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

  if (!cliente) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Cliente não encontrado</h2>
          <Button onClick={() => router.push("/dashboard/clientes")} className="mt-4">
            Voltar aos Clientes
          </Button>
        </div>
      </div>
    )
  }

  const resetEdificioForm = () => {
    setEdificioFormData({
      nome: "",
      morada: "",
      tipologia: "",
      nPisos: 1,
      areaBruta: 0,
      anoConstrucao: new Date().getFullYear(),
      estado: "EM_CURSO",
    })
  }

  const resetUserForm = () => {
    setUserFormData({
      nome: "",
      email: "",
      telefone: "",
      password: "",
      role: "VISUALIZADOR",
      status: "ATIVO",
    })
    setEditingUser(null)
  }

  const openEditUserModal = (utilizador: any) => {
    setEditingUser(utilizador)
    setUserFormData({
      nome: utilizador.nome,
      email: utilizador.email,
      telefone: utilizador.telefone || "",
      password: "", // Deixamos vazio para não alterar se não for fornecida
      role: utilizador.role,
      status: utilizador.status,
    })
    setShowEditUserModal(true)
  }

  const handleEditCliente = async () => {
    if (clienteFormData.nome && clienteFormData.email) {
      try {
        await updateCliente(clienteId, {
          nome: clienteFormData.nome.trim(),
          email: clienteFormData.email.trim(),
          telefone: clienteFormData.telefone.trim() || undefined,
          morada: clienteFormData.morada.trim() || undefined,
          nif: clienteFormData.nif.trim() || undefined,
          status: clienteFormData.status,
        })
        setShowEditClienteModal(false)
      } catch (error) {
        console.error('Erro ao atualizar cliente:', error)
      }
    }
  }

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8)
    setUserFormData({ ...userFormData, password })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleAddEdificio = async () => {
    if (edificioFormData.nome && edificioFormData.morada) {
      try {
        await addEdificio({
          nome: edificioFormData.nome.trim(),
          morada: edificioFormData.morada.trim(),
          tipologia: edificioFormData.tipologia || undefined,
          nPisos: edificioFormData.nPisos,
          areaBruta: edificioFormData.areaBruta,
          anoConstrucao: edificioFormData.anoConstrucao,
          estado: edificioFormData.estado,
          clienteId: clienteId,
        })
        resetEdificioForm()
        setShowAddEdificioModal(false)
      } catch (error) {
        console.error('Erro ao adicionar edifício:', error)
      }
    }
  }

  const handleAddUser = async () => {
    if (userFormData.nome && userFormData.email && userFormData.password) {
      try {
        await addUtilizador({
          nome: userFormData.nome.trim(),
          email: userFormData.email.trim(),
          telefone: userFormData.telefone.trim() || undefined,
          password: userFormData.password,
          role: userFormData.role,
          status: userFormData.status,
          clienteId: clienteId,
        })
        resetUserForm()
        setShowAddUserModal(false)
      } catch (error) {
        console.error('Erro ao adicionar utilizador:', error)
      }
    }
  }

  const handleEditUser = async () => {
    if (!editingUser || !userFormData.nome || !userFormData.email) return

    try {
      const updateData: any = {
        nome: userFormData.nome.trim(),
        email: userFormData.email.trim(),
        telefone: userFormData.telefone.trim() || undefined,
        role: userFormData.role,
        status: userFormData.status,
        clienteId: clienteId,
      }

      // Só incluir password se foi fornecida
      if (userFormData.password.trim()) {
        updateData.password = userFormData.password
      }

      await updateUtilizador(editingUser.id, updateData)
      resetUserForm()
      setShowEditUserModal(false)
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error)
    }
  }

  const handleDeleteEdificio = async (id: number) => {
    try {
      await deleteEdificio(id)
      setShowDeleteEdificioDialog(null)
    } catch (error) {
      console.error('Erro ao eliminar edifício:', error)
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUtilizador(id)
      setShowDeleteUserDialog(null)
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error)
    }
  }

  const handleToggleUserStatus = (userId: number, currentStatus: "ATIVO" | "INATIVO") => {
    // TODO: Implementar updateUtilizador no novo hook
    const newStatus = currentStatus === "ATIVO" ? "INATIVO" : "ATIVO"
    console.log('Toggle status utilizador:', userId, newStatus)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/clientes">Clientes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{cliente.nome}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edifícios de {cliente.nome}</h2>
          <p className="text-gray-600">Gerir projetos e utilizadores do cliente</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showEditClienteModal} onOpenChange={setShowEditClienteModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente-nome">Nome *</Label>
                  <Input
                    id="cliente-nome"
                    value={clienteFormData.nome}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, nome: e.target.value })}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente-email">Email *</Label>
                  <Input
                    id="cliente-email"
                    type="email"
                    value={clienteFormData.email}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente-telefone">Telefone</Label>
                  <Input
                    id="cliente-telefone"
                    value={clienteFormData.telefone}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, telefone: e.target.value })}
                    placeholder="+351 912 345 678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente-morada">Morada</Label>
                  <Input
                    id="cliente-morada"
                    value={clienteFormData.morada}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, morada: e.target.value })}
                    placeholder="Morada completa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente-nif">NIF</Label>
                  <Input
                    id="cliente-nif"
                    value={clienteFormData.nif}
                    onChange={(e) => setClienteFormData({ ...clienteFormData, nif: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente-status">Status</Label>
                  <Select
                    value={clienteFormData.status}
                    onValueChange={(value: "ATIVO" | "INATIVO") => setClienteFormData({ ...clienteFormData, status: value })}
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
                    onClick={() => setShowEditClienteModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleEditCliente}>Guardar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="font-medium">{cliente.email}</span>
              </div>
              {cliente.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Telefone:</span>
                  <span className="font-medium">{cliente.telefone}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {cliente.morada && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Morada:</span>
                  <span className="font-medium">{cliente.morada}</span>
                </div>
              )}
              {cliente.nif && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">NIF:</span>
                  <span className="font-medium">{cliente.nif}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Badge variant={cliente.status === "ATIVO" ? "default" : "secondary"}>
              {cliente.status === "ATIVO" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="edificios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="edificios" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Edifícios ({edificios.length})
          </TabsTrigger>
          <TabsTrigger value="utilizadores" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilizadores ({utilizadores.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edificios" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={showAddEdificioModal} onOpenChange={setShowAddEdificioModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Edifício
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Edifício</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={edificioFormData.nome}
                        onChange={(e) => setEdificioFormData({ ...edificioFormData, nome: e.target.value })}
                        placeholder="Nome do edifício"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipologia">Tipologia</Label>
                      <Select
                        value={edificioFormData.tipologia}
                        onValueChange={(value) => setEdificioFormData({ ...edificioFormData, tipologia: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar tipologia" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipologias.map((tip) => (
                            <SelectItem key={tip} value={tip}>
                              {tip}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="morada">Localização *</Label>
                    <Input
                      id="morada"
                      value={edificioFormData.morada}
                      onChange={(e) => setEdificioFormData({ ...edificioFormData, morada: e.target.value })}
                      placeholder="Morada completa"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nPisos">Nº Pisos</Label>
                      <Input
                        id="nPisos"
                        type="number"
                        min="1"
                        value={edificioFormData.nPisos}
                        onChange={(e) =>
                          setEdificioFormData({ ...edificioFormData, nPisos: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="areaBruta">Área Bruta (m²)</Label>
                      <Input
                        id="areaBruta"
                        type="number"
                        min="0"
                        value={edificioFormData.areaBruta}
                        onChange={(e) =>
                          setEdificioFormData({ ...edificioFormData, areaBruta: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="anoConstrucao">Ano Construção</Label>
                      <Input
                        id="anoConstrucao"
                        type="number"
                        min="1900"
                        max="2030"
                        value={edificioFormData.anoConstrucao}
                        onChange={(e) =>
                          setEdificioFormData({ ...edificioFormData, anoConstrucao: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={edificioFormData.estado}
                      onValueChange={(value: "EM_CURSO" | "FINALIZADO" | "PAUSADO") =>
                        setEdificioFormData({ ...edificioFormData, estado: value })
                      }
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
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddEdificioModal(false)
                        resetEdificioForm()
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAddEdificio}>Guardar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {edificios.map((edificio) => (
              <Card key={edificio.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{edificio.nome}</span>
                    <Badge variant={
                      edificio.estado === "EM_CURSO" ? "default" :
                      edificio.estado === "FINALIZADO" ? "secondary" : "outline"
                    }>
                      {edificio.estado === "EM_CURSO" ? "Em Curso" :
                       edificio.estado === "FINALIZADO" ? "Finalizado" : "Pausado"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {edificio.morada}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tipologia:</span>
                      <p className="font-medium">{edificio.tipologia || "Não definida"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Área:</span>
                      <p className="font-medium">{edificio.areaBruta ? `${edificio.areaBruta} m²` : "Não definida"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Pisos:</span>
                      <p className="font-medium">{edificio.nPisos || "Não definido"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Zonas:</span>
                      <p className="font-medium">
                        {typeof getZonasByEdificioId === 'function' 
                          ? getZonasByEdificioId(edificio.id)?.length || 0 
                          : edificio.zonasEspecificas?.length || 0
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/edificios/${edificio.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Abrir Ficha Técnica
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setShowDeleteEdificioDialog(edificio.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="utilizadores" className="space-y-6">
          {/* Informações de ajuda */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Gestão de Utilizadores</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Adicione utilizadores para dar acesso ao sistema Home Configurator. 
                    Cada utilizador pode ter diferentes níveis de permissão:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li><strong>Administrador:</strong> Acesso total ao sistema</li>
                    <li><strong>Gestor:</strong> Pode gerir projetos e materiais</li>
                    <li><strong>Visualizador:</strong> Apenas consulta informações</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Utilizadores do Cliente</h3>
              <p className="text-sm text-gray-600">
                {utilizadores.length === 0 ? 
                  "Nenhum utilizador configurado. Clique em 'Adicionar Utilizador' para começar." :
                  `${utilizadores.length} utilizador${utilizadores.length !== 1 ? 'es' : ''} configurado${utilizadores.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Utilizador
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-nome">Nome *</Label>
                    <Input
                      id="user-nome"
                      value={userFormData.nome}
                      onChange={(e) => setUserFormData({ ...userFormData, nome: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email *</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-telefone">Telefone</Label>
                    <Input
                      id="user-telefone"
                      value={userFormData.telefone}
                      onChange={(e) => setUserFormData({ ...userFormData, telefone: e.target.value })}
                      placeholder="+351 912 345 678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Função</Label>
                    <Select
                      value={userFormData.role}
                      onValueChange={(value: "ADMIN" | "GESTOR" | "VISUALIZADOR") =>
                        setUserFormData({ ...userFormData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="GESTOR">Gestor</SelectItem>
                        <SelectItem value="VISUALIZADOR">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Password *</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="user-password"
                          type={showPassword ? "text" : "password"}
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                          placeholder="Password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Esconder password" : "Mostrar password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                        className="whitespace-nowrap"
                      >
                        Gerar
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddUserModal(false)
                        resetUserForm()
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAddUser}>Guardar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {utilizadores.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum utilizador configurado</h3>
                    <p className="text-gray-500 mt-1">
                      Comece por adicionar o primeiro utilizador para este cliente.
                    </p>
                  </div>
                  <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="mt-4">
                        <Plus className="w-5 h-5 mr-2" />
                        Adicionar Primeiro Utilizador
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="user-nome">Nome *</Label>
                          <Input
                            id="user-nome"
                            value={userFormData.nome}
                            onChange={(e) => setUserFormData({ ...userFormData, nome: e.target.value })}
                            placeholder="Nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-email">Email *</Label>
                          <Input
                            id="user-email"
                            type="email"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-telefone">Telefone</Label>
                          <Input
                            id="user-telefone"
                            value={userFormData.telefone}
                            onChange={(e) => setUserFormData({ ...userFormData, telefone: e.target.value })}
                            placeholder="+351 912 345 678"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-role">Função</Label>
                          <Select
                            value={userFormData.role}
                            onValueChange={(value: "ADMIN" | "GESTOR" | "VISUALIZADOR") =>
                              setUserFormData({ ...userFormData, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Administrador</SelectItem>
                              <SelectItem value="GESTOR">Gestor</SelectItem>
                              <SelectItem value="VISUALIZADOR">Visualizador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-password">Password *</Label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1">
                              <Input
                                id="user-password"
                                type={showPassword ? "text" : "password"}
                                value={userFormData.password}
                                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                placeholder="Password"
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Esconder password" : "Mostrar password"}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generatePassword}
                              className="whitespace-nowrap"
                            >
                              Gerar
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddUserModal(false)
                              resetUserForm()
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleAddUser}>Guardar</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {utilizadores.map((utilizador) => (
              <Card key={utilizador.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{utilizador.nome}</span>
                    <Badge variant={utilizador.status === "ATIVO" ? "default" : "secondary"}>
                      {utilizador.status === "ATIVO" ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {utilizador.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Função:</span>
                      <p className="font-medium">
                        {utilizador.role === "ADMIN" ? "Administrador" :
                         utilizador.role === "GESTOR" ? "Gestor" : "Visualizador"}
                      </p>
                    </div>
                    {utilizador.telefone && (
                      <div>
                        <span className="text-gray-600">Telefone:</span>
                        <p className="font-medium">{utilizador.telefone}</p>
                      </div>
                    )}
                    {utilizador.ultimoAcesso && (
                      <div>
                        <span className="text-gray-600">Último acesso:</span>
                        <p className="font-medium">
                          {new Date(utilizador.ultimoAcesso).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditUserModal(utilizador)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setShowDeleteUserDialog(utilizador.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Edição de Utilizador */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-user-nome">Nome *</Label>
              <Input
                id="edit-user-nome"
                value={userFormData.nome}
                onChange={(e) => setUserFormData({ ...userFormData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-email">Email *</Label>
              <Input
                id="edit-user-email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-telefone">Telefone</Label>
              <Input
                id="edit-user-telefone"
                value={userFormData.telefone}
                onChange={(e) => setUserFormData({ ...userFormData, telefone: e.target.value })}
                placeholder="+351 912 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-role">Função</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value: "ADMIN" | "GESTOR" | "VISUALIZADOR") =>
                  setUserFormData({ ...userFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="GESTOR">Gestor</SelectItem>
                  <SelectItem value="VISUALIZADOR">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-status">Status</Label>
              <Select
                value={userFormData.status}
                onValueChange={(value: "ATIVO" | "INATIVO") =>
                  setUserFormData({ ...userFormData, status: value })
                }
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
            <div className="space-y-2">
              <Label htmlFor="edit-user-password">Nova Password (opcional)</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="edit-user-password"
                    type={showEditPassword ? "text" : "password"}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Deixe vazio para manter a atual"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    aria-label={showEditPassword ? "Esconder password" : "Mostrar password"}
                  >
                    {showEditPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                  className="whitespace-nowrap"
                >
                  Gerar
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditUserModal(false)
                  resetUserForm()
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditUser}>Atualizar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de eliminação de edifício */}
      <Dialog open={showDeleteEdificioDialog !== null} onOpenChange={() => setShowDeleteEdificioDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
          </DialogHeader>
          <p>Tem a certeza que deseja eliminar este edifício? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteEdificioDialog(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteEdificioDialog && handleDeleteEdificio(showDeleteEdificioDialog)}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de eliminação de utilizador */}
      <Dialog open={showDeleteUserDialog !== null} onOpenChange={() => setShowDeleteUserDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
          </DialogHeader>
          <p>Tem a certeza que deseja eliminar este utilizador? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteUserDialog(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteUserDialog && handleDeleteUser(showDeleteUserDialog)}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
