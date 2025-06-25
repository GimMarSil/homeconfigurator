'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, Package, Star, Eye, Download, Euro, Image } from 'lucide-react'
import { useApiData } from '@/hooks/use-api-data'
import { useToast } from '@/hooks/use-toast'

interface Material {
  id: number
  nome: string
  referencia?: string
  marca?: string
  descricao?: string
  precoUnitario: number
  fornecedor?: string
  imagem?: string
  isGlobal: boolean
  aprovado: boolean
  tipoMaterial: {
    id: number
    nome: string
    categoria: string
  }
  cliente?: {
    id: number
    nome: string
  }
  ficheiros: Array<{
    id: number
    nomeOriginal: string
    categoria: string
  }>
}

interface TipoMaterial {
  id: number
  nome: string
  categoria: string
}

interface FileData {
  id: number
  nomeOriginal: string
  caminho: string
  tipoMime: string
  categoria: string
}

interface MaterialCatalogProps {
  onMaterialSelect?: (material: Material) => void
  selectedMaterials?: number[]
  showImages?: boolean
  maxSelection?: number
}

export function MaterialCatalog({
  onMaterialSelect,
  selectedMaterials = [],
  showImages = true,
  maxSelection
}: MaterialCatalogProps) {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterAprovado, setFilterAprovado] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { toast } = useToast()

  const loadMateriais = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/materiais')
      if (response.ok) {
        const data = await response.json()
        setMateriais(data)
      } else {
        throw new Error('Erro ao carregar materiais')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMaterialFiles = async (materialId: number) => {
    try {
      const response = await fetch(`/api/upload?categoria=IMAGEM_MATERIAL&materialId=${materialId}`)
      if (response.ok) {
        const files = await response.json()
        return files
      }
    } catch (error) {
      console.error('Erro ao carregar ficheiros do material:', error)
    }
    return []
  }

  useEffect(() => {
    loadMateriais()
  }, [])

  // Carregar ficheiros para cada material
  useEffect(() => {
    const loadAllFiles = async () => {
      const materiaisComFicheiros = await Promise.all(
        materiais.map(async (material) => {
          const ficheiros = await loadMaterialFiles(material.id)
          return { ...material, ficheiros }
        })
      )
      setMateriais(materiaisComFicheiros)
    }

    if (materiais.length > 0) {
      loadAllFiles()
    }
  }, [materiais.length])

  const filteredMateriais = materiais.filter(material => {
    const matchesSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTipo = !filterTipo || material.tipoMaterial.categoria === filterTipo
    const matchesAprovado = filterAprovado === '' || 
                           (filterAprovado === 'true' && material.aprovado) ||
                           (filterAprovado === 'false' && !material.aprovado)

    return matchesSearch && matchesTipo && matchesAprovado
  })

  const handleMaterialClick = (material: Material) => {
    if (maxSelection && selectedMaterials.length >= maxSelection) {
      toast({
        title: "Limite atingido",
        description: `Máximo ${maxSelection} materiais permitidos`,
        variant: "destructive"
      })
      return
    }

    onMaterialSelect?.(material)
  }

  const isSelected = (materialId: number) => {
    return selectedMaterials.includes(materialId)
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A'
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getMainImage = (material: Material) => {
    if (!material.ficheiros || material.ficheiros.length === 0) return null
    return material.ficheiros.find(file => file.tipoMime.startsWith('image/'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, descrição, fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="REVESTIMENTO">Revestimento</SelectItem>
                  <SelectItem value="PINTURA">Pintura</SelectItem>
                  <SelectItem value="ILUMINACAO">Iluminação</SelectItem>
                  <SelectItem value="MOBILIARIO">Mobiliário</SelectItem>
                  <SelectItem value="SANITARIOS">Sanitários</SelectItem>
                  <SelectItem value="COZINHA">Cozinha</SelectItem>
                  <SelectItem value="OUTROS">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={filterAprovado} onValueChange={setFilterAprovado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Aprovados</SelectItem>
                  <SelectItem value="false">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterTipo('')
                  setFilterAprovado('')
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de materiais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMateriais.map((material) => {
          const mainImage = getMainImage(material)
          const isMaterialSelected = isSelected(material.id)
          
          return (
            <Card 
              key={material.id} 
              className={`hover:shadow-md transition-all cursor-pointer ${
                isMaterialSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleMaterialClick(material)}
            >
              <CardContent className="p-4">
                {/* Imagem do material */}
                {showImages && (
                  <div className="mb-4 aspect-square bg-muted rounded-lg overflow-hidden">
                    {mainImage ? (
                      <img
                        src={mainImage.caminho}
                        alt={material.nome}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImage(mainImage.caminho)
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )}

                {/* Informações do material */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm line-clamp-2" title={material.nome}>
                      {material.nome}
                    </h3>
                    <Badge variant={material.aprovado ? "default" : "secondary"} className="text-xs">
                      {material.aprovado ? 'Aprovado' : 'Pendente'}
                    </Badge>
                  </div>

                  {material.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {material.descricao}
                    </p>
                  )}

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span>{material.tipoMaterial.nome}</span>
                    </div>
                    
                    {material.fornecedor && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Fornecedor:</span>
                        <span className="truncate ml-2">{material.fornecedor}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Preço:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        {formatPrice(material.precoUnitario)}
                      </span>
                    </div>
                  </div>

                  {/* Indicador de seleção */}
                  {onMaterialSelect && (
                    <div className="pt-2">
                      <Button
                        variant={isMaterialSelected ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMaterialClick(material)
                        }}
                      >
                        {isMaterialSelected ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal de preview de imagem */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Preview da Imagem</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                Fechar
              </Button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {filteredMateriais.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum material encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou adicionar novos materiais.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 