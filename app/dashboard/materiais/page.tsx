"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useApiData } from "@/hooks/use-api-data"
import { Package, Plus, Search, Edit, Trash2, Eye, Euro, Filter, Building, MapPin, Image, FileText, Download, Upload, FileSpreadsheet, Database, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MaterialGallery } from "@/components/material-gallery"
import { MaterialImageCarousel } from "@/components/material-image-carousel"
import { PorcelanosaScraper } from "@/components/porcelanosa-scraper"
import Link from "next/link"

interface Material {
  id: number
  nome: string
  descricao: string | null
  tipo: string
  fornecedor: string | null
  preco: number | null
  unidade: string | null
  aprovado: boolean
  clienteId: number | null
  criadoEm: string
  edificio?: { id: number; nome: string } | null
  zona?: { id: number; nome: string } | null
}

export default function MateriaisPage() {
  const { 
    materiais, 
    tiposMaterial, 
    isLoading, 
    addMaterial, 
    updateMaterial, 
    deleteMaterial
  } = useApiData()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTipo, setSelectedTipo] = useState<string>("all")
  const [selectedDisponivel, setSelectedDisponivel] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [isScraperOpen, setIsScraperOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [isForceDeleteDialogOpen, setIsForceDeleteDialogOpen] = useState(false)
  const [forceDeleteData, setForceDeleteData] = useState<{
    id: number
    nome: string
    errorData: any
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [materialFiles, setMaterialFiles] = useState<any[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: "",
    referencia: "",
    marca: "",
    descricao: "",
    precoUnitario: "",
    fornecedor: "",
    urlFabricante: "",
    imagem: "",
    fichaTecnica: "",
    disponivel: true,
    tipoMaterialId: "",
  })

  const { toast } = useToast()

  // Filtrar materiais
  const materiaisFiltrados = materiais.filter(material => {
    const matchesSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.marca && material.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (material.referencia && material.referencia.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTipo = selectedTipo === "all" || material.tipoMaterial.id.toString() === selectedTipo
    const matchesDisponivel = selectedDisponivel === "all" || material.disponivel.toString() === selectedDisponivel
    return matchesSearch && matchesTipo && matchesDisponivel
  })

  // Estatísticas
  const stats = {
    total: materiais.length,
    disponiveis: materiais.filter(m => m.disponivel).length,
    aprovados: materiais.filter(m => m.aprovado).length,
    precoMedio: materiais.length > 0 ? materiais.reduce((acc, m) => acc + (m.precoUnitario || 0), 0) / materiais.length : 0
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      referencia: "",
      marca: "",
      descricao: "",
      precoUnitario: "",
      fornecedor: "",
      urlFabricante: "",
      imagem: "",
      fichaTecnica: "",
      disponivel: true,
      tipoMaterialId: "",
    })
    setSelectedMaterial(null)
  }

  const openDialog = (material?: any) => {
    if (material) {
      setSelectedMaterial(material)
      setFormData({
        nome: material.nome,
        referencia: material.referencia || "",
        marca: material.marca || "",
        descricao: material.descricao || "",
        precoUnitario: material.precoUnitario.toString(),
        fornecedor: material.fornecedor || "",
        urlFabricante: material.urlFabricante || "",
        imagem: material.imagem || "",
        fichaTecnica: material.fichaTecnica || "",
        disponivel: material.disponivel,
        tipoMaterialId: material.tipoMaterial.id.toString(),
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const materialData = {
        ...formData,
        precoUnitario: parseFloat(formData.precoUnitario) || 0,
        tipoMaterialId: parseInt(formData.tipoMaterialId),
      }

      if (selectedMaterial) {
        await updateMaterial(selectedMaterial.id, materialData)
        toast({
          title: "Sucesso",
          description: "Material atualizado com sucesso!",
        })
      } else {
        await addMaterial(materialData)
        toast({
          title: "Sucesso", 
          description: "Material criado com sucesso!",
        })
      }
      
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar material",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number, materialNome: string) => {
    try {
      await deleteMaterial(id)
    } catch (error: any) {
      // Verificar se é erro de integridade referencial
      if (error.message?.includes('REFERENTIAL_INTEGRITY')) {
        try {
          const errorData = JSON.parse(error.message)
          
          // Mostrar diálogo de confirmação para eliminação forçada
          const shouldForceDelete = window.confirm(
            `${errorData.message}\n\n` +
            `Detalhes: ${errorData.details}\n\n` +
            `Sugestão: ${errorData.suggestion}\n\n` +
            `Deseja eliminar o material forçadamente? (Isso pode deixar registros órfãos)`
          )
          
          if (shouldForceDelete) {
            try {
              await deleteMaterial(id, { force: true })
            } catch (forceError: any) {
              toast({
                title: "Erro",
                description: forceError.message || "Erro ao eliminar forçadamente",
                variant: "destructive",
              })
            }
          }
        } catch (parseError) {
          // Fallback se não conseguir parsear o erro
          toast({
            title: "Não é possível eliminar",
            description: `O material "${materialNome}" não pode ser eliminado porque está a ser usado em outras partes do sistema.`,
            variant: "destructive",
          })
        }
      } else if (error.message?.includes('409') || error.message?.includes('integridade')) {
        toast({
          title: "Não é possível eliminar",
          description: `O material "${materialNome}" não pode ser eliminado porque está a ser usado em zonas ou seleções.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro",
          description: error.message || "Erro inesperado ao eliminar material",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteWithConfirmation = async (id: number, materialNome: string) => {
    try {
      await deleteMaterial(id)
    } catch (error: any) {
      // Verificar se é erro de integridade referencial
      if (error.message?.includes('REFERENTIAL_INTEGRITY')) {
        try {
          const errorData = JSON.parse(error.message)
          
          // Abrir diálogo de confirmação para eliminação forçada
          setForceDeleteData({
            id,
            nome: materialNome,
            errorData
          })
          setIsForceDeleteDialogOpen(true)
        } catch (parseError) {
          // Fallback se não conseguir parsear o erro
          toast({
            title: "Não é possível eliminar",
            description: `O material "${materialNome}" não pode ser eliminado porque está a ser usado em outras partes do sistema.`,
            variant: "destructive",
          })
        }
      } else if (error.message?.includes('409') || error.message?.includes('integridade')) {
        toast({
          title: "Não é possível eliminar",
          description: `O material "${materialNome}" não pode ser eliminado porque está a ser usado em zonas ou seleções.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro",
          description: error.message || "Erro inesperado ao eliminar material",
          variant: "destructive",
        })
      }
    }
  }

  const handleForceDelete = async () => {
    if (!forceDeleteData) return
    
    try {
      await deleteMaterial(forceDeleteData.id, { force: true })
      setIsForceDeleteDialogOpen(false)
      setForceDeleteData(null)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar forçadamente",
        variant: "destructive",
      })
    }
  }

  // Função para lidar com produto extraído do scraper
  const handleScrapedProduct = async (product: any) => {
    try {
      console.log('🔄 Processando produto do scraper:', product)
      
      // Se o material já foi criado pelo scraper (tem ID)
      if (product.id) {
        // Recarregar a lista de materiais para mostrar o novo material
        console.log('✅ Material criado pelo scraper, a recarregar lista...')
        
        // Forçar recarregamento dos dados
        window.location.reload()
        
        toast({
          title: "Sucesso!",
          description: "Material criado com sucesso a partir do scraper da Porcelanosa",
        })

        // Fechar o diálogo
        setIsDialogOpen(false)
        resetForm()
        return
      }

      // Fallback: criar o material base (caso o scraper não tenha criado)
      console.log('⚠️ Material não criado pelo scraper, criando manualmente...')
      const materialData = {
        nome: product.nome || 'Produto Porcelanosa',
        referencia: product.referencia || '',
        marca: product.marca || 'Porcelanosa',
        descricao: product.descricao || '',
        precoUnitario: product.precoUnitario || 0,
        fornecedor: product.fornecedor || 'Porcelanosa',
        urlFabricante: product.urlFabricante || '',
        imagem: product.imagem || '',
        fichaTecnica: product.fichaTecnica || '',
        disponivel: product.disponivel !== false,
        tipoMaterialId: product.tipoMaterialId || 1,
      }

      const newMaterial = await addMaterial(materialData)
      
      // Se há imagens adicionais, fazer upload delas
      if (product.imagens && product.imagens.length > 1) {
        for (let i = 1; i < product.imagens.length; i++) {
          const imageUrl = product.imagens[i]
          try {
            const response = await fetch('/api/upload/material', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                materialId: newMaterial.id,
                url: imageUrl,
                categoria: 'imagem',
                descricao: `Imagem ${i + 1} do produto`
              }),
            })
          } catch (error) {
            console.error('Erro ao fazer upload de imagem adicional:', error)
          }
        }
      }

      // Se há documentos, fazer upload deles
      if (product.documentos) {
        for (const [docType, docUrl] of Object.entries(product.documentos)) {
          if (docUrl) {
            try {
              const response = await fetch('/api/upload/material', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  materialId: newMaterial.id,
                  url: docUrl as string,
                  categoria: docType,
                  descricao: `Documento ${docType} do produto`
                }),
              })
            } catch (error) {
              console.error('Erro ao fazer upload de documento:', error)
            }
          }
        }
      }

      toast({
        title: "Sucesso!",
        description: "Material criado com sucesso a partir do scraper da Porcelanosa",
      })

      // Fechar o diálogo
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('❌ Erro ao processar produto do scraper:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar material a partir do scraper",
        variant: "destructive",
      })
    }
  }

  // Importação em massa
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      parseImportFile(file)
    }
  }

  const parseImportFile = async (file: File) => {
    const text = await file.text()
    let data: any[] = []

    try {
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        }).filter(item => item.nome) // Filtrar linhas vazias
      }

      // Validar e formatar dados
      const validatedData = data.map(item => ({
        nome: item.nome || '',
        referencia: item.referencia || '',
        marca: item.marca || '',
        descricao: item.descricao || '',
        precoUnitario: parseFloat(item.precoUnitario || item.preco || '0') || 0,
        fornecedor: item.fornecedor || '',
        urlFabricante: item.urlFabricante || '',
        imagem: item.imagem || '',
        fichaTecnica: item.fichaTecnica || '',
        disponivel: item.disponivel !== 'false' && item.disponivel !== false,
        tipoMaterialId: parseInt(item.tipoMaterialId || '1') || 1,
      }))

      setImportPreview(validatedData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar ficheiro. Verifique o formato.",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    try {
      for (const materialData of importPreview) {
        if (materialData.nome) {
          await addMaterial(materialData)
        }
      }
      
      toast({
        title: "Sucesso",
        description: `${importPreview.length} materiais importados com sucesso!`,
      })
      
      setIsDialogOpen(false)
      setImportFile(null)
      setImportPreview([])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro durante a importação",
        variant: "destructive",
      })
    }
  }

  const downloadTemplate = () => {
    const template = {
      csv: `nome,referencia,marca,descricao,precoUnitario,fornecedor,urlFabricante,imagem,fichaTecnica,disponivel,tipoMaterialId
Azulejo Exemplo,AZ001,Marca Exemplo,Descrição do material,25.50,Fornecedor Lda,https://fabricante.com,https://imagem.jpg,https://ficha.pdf,true,1`,
      json: [
        {
          nome: "Azulejo Exemplo",
          referencia: "AZ001", 
          marca: "Marca Exemplo",
          descricao: "Descrição do material",
          precoUnitario: 25.50,
          fornecedor: "Fornecedor Lda",
          urlFabricante: "https://fabricante.com",
          imagem: "https://imagem.jpg",
          fichaTecnica: "https://ficha.pdf",
          disponivel: true,
          tipoMaterialId: 1
        }
      ]
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template.json, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "template_materiais.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const openDetailModal = async (material: any) => {
    setSelectedMaterial(material)
    setIsDetailOpen(true)
    setLoadingFiles(true)
    
    try {
      // Carregar ficheiros do material
      const response = await fetch(`/api/materiais/${material.id}/ficheiros`)
      if (response.ok) {
        const files = await response.json()
        setMaterialFiles(files)
      } else {
        setMaterialFiles([])
      }
    } catch (error) {
      console.error('Erro ao carregar ficheiros:', error)
      setMaterialFiles([])
    } finally {
      setLoadingFiles(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">Materiais</h1>
          <p className="text-gray-600">Gerir o catálogo de materiais disponíveis</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar em Massa
          </Button>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disponiveis}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tiposMaterial.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.precoMedio)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar por nome, marca ou referência..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {tiposMaterial.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDisponivel} onValueChange={setSelectedDisponivel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Disponibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Disponíveis</SelectItem>
                <SelectItem value="false">Indisponíveis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiais */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Materiais</CardTitle>
          <CardDescription>
            {materiaisFiltrados.length} materiais encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {materiaisFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum material encontrado</h3>
              <p className="text-gray-600 mb-6">
                Não existem materiais que correspondam aos critérios de pesquisa.
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Material
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {materiaisFiltrados.map((material) => (
                <Card key={material.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={material.disponivel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {material.disponivel ? "Disponível" : "Indisponível"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailModal(material)}
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(material)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar material</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem a certeza que deseja eliminar "{material.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => {
                                  handleDeleteWithConfirmation(material.id, material.nome)
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{material.nome}</CardTitle>
                    <CardDescription>
                      {material.marca} - {material.tipoMaterial.nome}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Carrossel de Imagens */}
                  <div className="px-6 pb-3">
                    <MaterialImageCarousel 
                      materialId={material.id}
                      materialName={material.nome}
                      className="w-full h-32"
                    />
                  </div>
                  <CardContent>
                    <div className="space-y-2">
                      {material.referencia && (
                        <div className="text-sm">
                          <strong>Ref:</strong> {material.referencia}
                        </div>
                      )}
                      {material.fornecedor && (
                        <div className="text-sm">
                          <strong>Fornecedor:</strong> {material.fornecedor}
                        </div>
                      )}
                      <div className="text-sm">
                        <strong>Preço:</strong> {formatPrice(material.precoUnitario)} / {material.tipoMaterial.unidadeMedida}
                      </div>
                      {material.descricao && (
                        <div className="text-sm text-gray-600 mt-2">
                          {material.descricao.substring(0, 100)}
                          {material.descricao.length > 100 && '...'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição/Criação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial ? 'Editar Material' : 'Novo Material'}
            </DialogTitle>
          </DialogHeader>
          
          {!selectedMaterial && (
            <div className="mb-4">
              <PorcelanosaScraper 
                tiposMaterial={tiposMaterial}
                onProductScraped={handleScrapedProduct}
                onClose={() => setIsDialogOpen(false)}
              />
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Material *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipoMaterialId">Tipo de Material *</Label>
                <Select
                  value={formData.tipoMaterialId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipoMaterialId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMaterial.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referencia">Referência</Label>
                <Input
                  id="referencia"
                  value={formData.referencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, referencia: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precoUnitario">Preço Unitário (€)</Label>
                <Input
                  id="precoUnitario"
                  type="number"
                  step="0.01"
                  value={formData.precoUnitario}
                  onChange={(e) => setFormData(prev => ({ ...prev, precoUnitario: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urlFabricante">URL do Fabricante</Label>
                <Input
                  id="urlFabricante"
                  type="url"
                  value={formData.urlFabricante}
                  onChange={(e) => setFormData(prev => ({ ...prev, urlFabricante: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imagem">URL da Imagem</Label>
                <Input
                  id="imagem"
                  type="url"
                  value={formData.imagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, imagem: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fichaTecnica">URL da Ficha Técnica</Label>
              <Input
                id="fichaTecnica"
                type="url"
                value={formData.fichaTecnica}
                onChange={(e) => setFormData(prev => ({ ...prev, fichaTecnica: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="disponivel"
                checked={formData.disponivel}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, disponivel: checked }))}
              />
              <Label htmlFor="disponivel">Material disponível</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedMaterial ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Importação */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Importar Materiais em Massa</DialogTitle>
            <DialogDescription>
              Suporte para ficheiros JSON e CSV
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Suporte para ficheiros JSON e CSV
              </p>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-center">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium">Selecione um ficheiro</p>
                <p className="text-sm text-gray-600 mb-4">JSON ou CSV até 10MB</p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Escolher Ficheiro
                </Button>
              </div>
            </div>

            {importFile && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Ficheiro selecionado:</p>
                <p className="text-sm text-gray-600">{importFile.name}</p>
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview ({importPreview.length} materiais):</p>
                <div className="max-h-60 overflow-y-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Disponível</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreview.slice(0, 5).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.nome}</TableCell>
                          <TableCell>{item.marca}</TableCell>
                          <TableCell>{formatPrice(item.precoUnitario)}</TableCell>
                          <TableCell>
                            <Badge className={item.disponivel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {item.disponivel ? "Sim" : "Não"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {importPreview.length > 5 && (
                    <p className="text-sm text-gray-600 p-2">
                      ... e mais {importPreview.length - 5} materiais
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancelar
            </Button>
            {importPreview.length > 0 && (
              <Button onClick={handleImport}>
                <Database className="h-4 w-4 mr-2" />
                Importar {importPreview.length} Materiais
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes do material */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Material</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {selectedMaterial.nome}
                    <Badge variant={selectedMaterial.disponivel ? "default" : "secondary"}>
                      {selectedMaterial.disponivel ? "Disponível" : "Indisponível"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {selectedMaterial.marca} • {selectedMaterial.tipoMaterial?.nome} • Ref: {selectedMaterial.referencia || 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Preço:</span> €{selectedMaterial.precoUnitario || 0}
                    </div>
                    <div>
                      <span className="font-medium">Fornecedor:</span> {selectedMaterial.fornecedor}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span> 
                      <Badge variant={selectedMaterial.aprovado ? "default" : "outline"} className="ml-2">
                        {selectedMaterial.aprovado ? "Aprovado" : "Pendente"}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Total Ficheiros:</span> {materialFiles?.length || 0}
                    </div>
                  </div>
                  {selectedMaterial.descricao && (
                    <div className="mt-4">
                      <span className="font-medium">Descrição:</span>
                      <p className="text-gray-600 mt-1">{selectedMaterial.descricao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Galeria de ficheiros e upload */}
              <MaterialGallery ficheiros={materialFiles || []} material={selectedMaterial} canUpload={true} />

              {/* Características técnicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Características Técnicas</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMaterial.caracteristicas && Object.keys(selectedMaterial.caracteristicas).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedMaterial.caracteristicas).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">{key}</div>
                          <div className="text-sm text-gray-600">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Sem características técnicas registadas.</div>
                  )}
                </CardContent>
              </Card>

              {/* Informações de embalagem */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações de Embalagem</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMaterial.embalagem && Object.keys(selectedMaterial.embalagem).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedMaterial.embalagem).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">{key}</div>
                          <div className="text-sm text-gray-600">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Sem informações de embalagem registadas.</div>
                  )}
                </CardContent>
              </Card>

              {/* Informações de instalação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações de Instalação</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMaterial.instalacao && Object.keys(selectedMaterial.instalacao).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedMaterial.instalacao).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">{key}</div>
                          <div className="text-sm text-gray-600">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Sem informações de instalação registadas.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de eliminação forçada */}
      <Dialog open={isForceDeleteDialogOpen} onOpenChange={setIsForceDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Eliminar material com dependências
            </DialogTitle>
          </DialogHeader>
          
          {forceDeleteData && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  O material <strong>"{forceDeleteData.nome}"</strong> não pode ser eliminado normalmente porque está sendo usado em outras partes do sistema.
                </p>
                
                {forceDeleteData.errorData && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h4 className="font-medium text-yellow-800 mb-2">Detalhes do problema:</h4>
                    <p className="text-sm text-yellow-700 mb-2">{forceDeleteData.errorData.details}</p>
                    
                    {forceDeleteData.errorData.relatedCounts && (
                      <div className="text-xs text-yellow-600 space-y-1">
                        <p>• {forceDeleteData.errorData.relatedCounts.materiaisSelecionados} seleções em zonas</p>
                        <p>• {forceDeleteData.errorData.relatedCounts.zonaTipoMateriais} tipos de zona</p>
                        <p>• {forceDeleteData.errorData.relatedCounts.ficheiros} ficheiros</p>
                        <p>• {forceDeleteData.errorData.relatedCounts.comentarios} comentários</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <h4 className="font-medium text-red-800 mb-2">⚠️ Aviso importante:</h4>
                  <p className="text-sm text-red-700">
                    A eliminação forçada irá remover o material mas pode deixar registros órfãos no sistema. 
                    Recomenda-se usar a eliminação em cascata para uma limpeza completa.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsForceDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            
            {forceDeleteData && (
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    await deleteMaterial(forceDeleteData.id, { cascade: true })
                    setIsForceDeleteDialogOpen(false)
                    setForceDeleteData(null)
                  } catch (error: any) {
                    toast({
                      title: "Erro",
                      description: error.message || "Erro ao eliminar em cascata",
                      variant: "destructive",
                    })
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Eliminar em Cascata
              </Button>
            )}
            
            <Button 
              onClick={handleForceDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Forçadamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
