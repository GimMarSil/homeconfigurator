"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Globe, Download, Image, FileText, Package, Wrench, CheckCircle, AlertCircle } from "lucide-react"

interface ScrapedProduct {
  id?: number
  nome: string
  referencia: string
  marca: string
  descricao: string
  precoUnitario: number
  fornecedor: string
  urlFabricante: string
  imagem: string
  fichaTecnica: string
  disponivel: boolean
  tipoMaterialId: number
  caracteristicas: Record<string, string>
  embalagem: Record<string, string>
  instalacao: Record<string, string>
  imagens: string[]
  documentos: Record<string, string>
  criadoEm?: string
  atualizadoEm?: string
  tipoMaterial?: any
  cliente?: any
}

interface PorcelanosaScraperProps {
  tiposMaterial: any[]
  onProductScraped: (product: ScrapedProduct) => void
  onClose: () => void
}

export function PorcelanosaScraper({ tiposMaterial, onProductScraped, onClose }: PorcelanosaScraperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedProduct, setScrapedProduct] = useState<ScrapedProduct | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    referencia: "",
    marca: "Porcelanosa",
    descricao: "",
    precoUnitario: "",
    fornecedor: "Porcelanosa",
    urlFabricante: "",
    imagem: "",
    fichaTecnica: "",
    disponivel: true,
    tipoMaterialId: "",
  })
  
  const { toast } = useToast()

  const handleScrape = async () => {
    if (!url || !url.includes('porcelanosagrupo.com')) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida da Porcelanosa",
        variant: "destructive",
      })
      return
    }

    setIsScraping(true)
    try {
      const response = await fetch('/api/scraper/porcelanosa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const product = result.data
        setScrapedProduct(product)
        
        // Se o material já foi criado pelo scraper (tem ID), notificar sucesso
        if (product.id) {
          toast({
            title: "Sucesso!",
            description: `Material "${product.nome}" criado com sucesso! ID: ${product.id}`,
          })

          // Chamar callback para atualizar a lista de materiais
          onProductScraped(product)
          
          // Fechar o componente
          onClose()
        } else {
          // Fallback: preencher formulário para criação manual
          setFormData({
            nome: product.nome || '',
            referencia: product.referencia || '',
            marca: product.marca || 'Porcelanosa',
            descricao: product.descricao || '',
            precoUnitario: (product.precoUnitario || 0).toString(),
            fornecedor: product.fornecedor || 'Porcelanosa',
            urlFabricante: product.urlFabricante || url,
            imagem: product.imagem || '',
            fichaTecnica: product.fichaTecnica || '',
            disponivel: product.disponivel !== false,
            tipoMaterialId: (product.tipoMaterialId || product.tipoMaterial?.id || 1).toString(),
          })

          toast({
            title: "Dados extraídos",
            description: "Produto extraído com sucesso da Porcelanosa. Verifique os dados antes de criar.",
          })
        }
      } else {
        const errorMsg = result.error || result.details || 'Erro ao fazer scraper'
        console.error('Erro do servidor:', result)
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('Erro no scraper:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer scraper do produto",
        variant: "destructive",
      })
    } finally {
      setIsScraping(false)
    }
  }

  const handleCreateMaterial = () => {
    if (!formData.nome || !formData.tipoMaterialId) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e tipo de material são obrigatórios",
        variant: "destructive",
      })
      return
    }

    // Criar material manualmente com os dados do formulário
    const materialData = {
      ...formData,
      precoUnitario: parseFloat(formData.precoUnitario) || 0,
      tipoMaterialId: parseInt(formData.tipoMaterialId),
      caracteristicas: scrapedProduct?.caracteristicas || {},
      embalagem: scrapedProduct?.embalagem || {},
      instalacao: scrapedProduct?.instalacao || {},
      imagens: scrapedProduct?.imagens || [],
      documentos: scrapedProduct?.documentos || {},
    }

    onProductScraped(materialData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Globe className="h-4 w-4 mr-2" />
          Scraper Porcelanosa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scraper Porcelanosa</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">URL do Produto Porcelanosa</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://productfinder.porcelanosagrupo.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScraping}
              />
              <Button 
                onClick={handleScrape} 
                disabled={isScraping || !url}
                className="min-w-[120px]"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extraindo...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Extrair
                  </>
                )}
              </Button>
            </div>
          </div>

          {scrapedProduct && (
            <Tabs defaultValue="form" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="form">Formulário</TabsTrigger>
                <TabsTrigger value="caracteristicas">Características</TabsTrigger>
                <TabsTrigger value="embalagem">Embalagem</TabsTrigger>
                <TabsTrigger value="instalacao">Instalação</TabsTrigger>
              </TabsList>

              <TabsContent value="form" className="space-y-4">
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
                    rows={3}
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
                    <Label htmlFor="imagem">URL da Imagem Principal</Label>
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

                {/* Resumo dos ficheiros extraídos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Ficheiros Extraídos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Imagens</span>
                          <Badge variant="secondary">{scrapedProduct.imagens?.length || 0}</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {scrapedProduct.imagens?.slice(0, 3).map((img, i) => (
                            <div key={i} className="truncate">{img.split('/').pop()}</div>
                          )) || []}
                          {(scrapedProduct.imagens?.length || 0) > 3 && (
                            <div className="text-gray-500">... e mais {(scrapedProduct.imagens?.length || 0) - 3}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Documentos</span>
                          <Badge variant="secondary">{Object.keys(scrapedProduct.documentos || {}).length}</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {Object.keys(scrapedProduct.documentos || {}).map((doc, i) => (
                            <div key={i} className="truncate">{doc}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="caracteristicas" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Características Técnicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(scrapedProduct.caracteristicas || {}).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">{key}</div>
                          <div className="text-sm text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="embalagem" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informações de Embalagem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(scrapedProduct.embalagem || {}).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">{key}</div>
                          <div className="text-sm text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instalacao" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informações de Instalação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(scrapedProduct.instalacao || {}).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">{key}</div>
                          <div className="text-sm text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          {scrapedProduct && (
            <Button onClick={handleCreateMaterial}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Criar Material
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 