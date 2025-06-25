"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApiData } from "@/hooks/use-api-data"
import { FileUpload } from "@/components/file-upload"
import { ArrowLeft, Building, Plus, Users, MapPin, Calendar, Ruler, Edit, Trash2, Home, Upload, FileText, Image } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { FileManager } from "@/components/file-manager"

export default function EdificioPage() {
  const params = useParams()
  const router = useRouter()
  const edificioId = parseInt(params.id as string)

  const { 
    edificios, 
    zonas,
    zonasTipo,
    clientes, 
    isLoaded, 
    isLoading, 
    error,
    getEdificioById,
    getClienteById,
    getZonasByEdificioId,
    addZona,
    fetchZonas
  } = useApiData()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    area: "",
    zonaTipoId: "",
    estado: "PENDENTE" as const,
  })

  const edificio = getEdificioById(edificioId)
  const cliente = edificio ? getClienteById(edificio.clienteId) : null
  const zonasEdificio = getZonasByEdificioId(edificioId)

  // Estados das zonas
  const estadosZona = {
    PENDENTE: { label: "Pendente", color: "bg-gray-100 text-gray-800" },
    EM_PROGRESSO: { label: "Em Progresso", color: "bg-blue-100 text-blue-800" },
    CONCLUIDO: { label: "Concluído", color: "bg-green-100 text-green-800" },
  }

  const { toast } = useToast()

  useEffect(() => {
    if (edificioId) {
      fetchZonas(edificioId)
    }
  }, [edificioId, fetchZonas])

  const resetForm = () => {
    setFormData({
      nome: "",
      area: "",
      zonaTipoId: "",
      estado: "PENDENTE",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const zonaData = {
        ...formData,
        area: parseFloat(formData.area),
        edificioId,
        zonaTipoId: parseInt(formData.zonaTipoId),
      }

      await addZona(zonaData)
      setIsDialogOpen(false)
      resetForm()
      fetchZonas(edificioId) // Recarregar zonas
    } catch (error) {
      console.error('Erro ao criar zona:', error)
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

  if (!edificio) {
    return (
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edifício não encontrado</h1>
        <p className="text-gray-600 mb-4">O edifício que procura não existe ou foi removido.</p>
        <Button asChild>
          <Link href="/dashboard/edificios">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Edifícios
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/edificios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{edificio.nome}</h1>
            <p className="text-muted-foreground">{edificio.morada}</p>
          </div>
        </div>
        <Badge variant={edificio.estado === 'EM_CURSO' ? 'default' : edificio.estado === 'FINALIZADO' ? 'secondary' : 'destructive'}>
          {edificio.estado === 'EM_CURSO' ? 'Em Curso' : edificio.estado === 'FINALIZADO' ? 'Finalizado' : 'Pausado'}
        </Badge>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="zonas">Zonas ({zonasEdificio?.length || 0})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="plantas">Plantas</TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="geral" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informações do Edifício */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações do Edifício
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg">{edificio.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Morada</label>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {edificio.morada}
                  </p>
                </div>
                {edificio.tipologia && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipologia</label>
                    <p>{edificio.tipologia}</p>
                  </div>
                )}
                {edificio.areaBruta && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Área Bruta</label>
                    <p className="flex items-center gap-1">
                      <Ruler className="h-4 w-4" />
                      {edificio.areaBruta} m²
                    </p>
                  </div>
                )}
                {edificio.nPisos && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Número de Pisos</label>
                    <p>{edificio.nPisos}</p>
                  </div>
                )}
                {edificio.anoConstrucao && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ano de Construção</label>
                    <p>{edificio.anoConstrucao}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <Badge variant={edificio.estado === 'EM_CURSO' ? 'default' : edificio.estado === 'FINALIZADO' ? 'secondary' : 'destructive'}>
                    {edificio.estado === 'EM_CURSO' ? 'Em Curso' : edificio.estado === 'FINALIZADO' ? 'Finalizado' : 'Pausado'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cliente ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome do Cliente</label>
                      <p className="text-lg">{cliente.nome}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p>{cliente.email}</p>
                    </div>
                    {cliente.telefone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                        <p>{cliente.telefone}</p>
                      </div>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/clientes/${cliente.id}`}>
                        Ver Cliente
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Cliente não encontrado</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Zonas */}
        <TabsContent value="zonas" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Zonas do Edifício</h2>
            <Button asChild>
              <Link href={`/dashboard/zonas?edificioId=${edificio.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Gerir Zonas
              </Link>
            </Button>
          </div>

          {!zonasEdificio || zonasEdificio.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhuma zona definida</h3>
                <p className="text-muted-foreground mb-4">
                  Este edifício ainda não tem zonas definidas.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/zonas?edificioId=${edificio.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Zona
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {zonasEdificio.map((zona) => (
                <Card key={zona.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{zona.nome}</h3>
                        <p className="text-sm text-muted-foreground">{zona.zonaTipo?.nome || "Tipo não definido"}</p>
                      </div>
                      <Badge variant="outline">{zona.area ? `${zona.area}m²` : "N/A"}</Badge>
                    </div>
                    
                    {zona.descricao && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {zona.descricao}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        className={estadosZona[zona.estado]?.color || "bg-gray-100 text-gray-800"}
                      >
                        {estadosZona[zona.estado]?.label || zona.estado}
                      </Badge>
                      
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/zonas/${zona.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Aba Documentos */}
        <TabsContent value="documentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos do Edifício
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileManager
                edificioId={edificio.id}
                showUpload={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Plantas */}
        <TabsContent value="plantas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Plantas e Desenhos Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileManager
                categoria="PLANTA_EDIFICIO"
                edificioId={edificio.id}
                showUpload={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
