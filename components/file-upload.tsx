"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Upload, File, X, Eye, Download, Trash2, Image, FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface FileUploadProps {
  entityType: 'edificio' | 'zona' | 'material'
  entityId: number
  entityName: string
  allowedCategories?: string[]
  onFileUploaded?: () => void
  maxFiles?: number
  categoria: string
  edificioId?: number
  zonaId?: number
  materialId?: number
  comentarioId?: number
  onUploadComplete?: (file: any) => void
  maxSize?: number // em MB
}

interface UploadedFile {
  id: number
  nomeOriginal: string
  nomeArquivo: string
  caminho: string
  tamanho: number
  tipoMime: string
  categoria: string
  descricao?: string
  criadoEm: string
}

const CATEGORIA_LABELS = {
  PLANTA_EDIFICIO: 'Planta do Edifício',
  DESENHO_TECNICO: 'Desenho Técnico',
  DOCUMENTO_LEGAL: 'Documento Legal',
  FOTO_ZONA: 'Foto da Zona',
  FICHA_TECNICA: 'Ficha Técnica',
  IMAGEM_MATERIAL: 'Imagem do Material',
  CERTIFICACAO: 'Certificação',
  MANUAL_INSTALACAO: 'Manual de Instalação',
  GARANTIA: 'Garantia',
  OUTROS: 'Outros'
}

const CATEGORIA_COLORS = {
  PLANTA_EDIFICIO: 'bg-blue-100 text-blue-800',
  DESENHO_TECNICO: 'bg-cyan-100 text-cyan-800',
  DOCUMENTO_LEGAL: 'bg-yellow-100 text-yellow-800',
  FOTO_ZONA: 'bg-green-100 text-green-800',
  FICHA_TECNICA: 'bg-purple-100 text-purple-800',
  IMAGEM_MATERIAL: 'bg-pink-100 text-pink-800',
  CERTIFICACAO: 'bg-orange-100 text-orange-800',
  MANUAL_INSTALACAO: 'bg-indigo-100 text-indigo-800',
  GARANTIA: 'bg-red-100 text-red-800',
  OUTROS: 'bg-gray-100 text-gray-800'
}

export function FileUpload({ 
  entityType, 
  entityId, 
  entityName, 
  allowedCategories,
  onFileUploaded,
  maxFiles = 10 
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [description, setDescription] = useState('')
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Determinar categorias permitidas baseado no tipo de entidade
  const getDefaultCategories = useCallback(() => {
    switch (entityType) {
      case 'edificio':
        return ['PLANTA_EDIFICIO', 'DESENHO_TECNICO', 'DOCUMENTO_LEGAL', 'OUTROS']
      case 'zona':
        return ['FOTO_ZONA', 'DESENHO_TECNICO', 'OUTROS']
      case 'material':
        return ['FICHA_TECNICA', 'IMAGEM_MATERIAL', 'CERTIFICACAO', 'MANUAL_INSTALACAO', 'GARANTIA', 'OUTROS']
      default:
        return ['OUTROS']
    }
  }, [entityType])

  const availableCategories = allowedCategories || getDefaultCategories()

  // Carregar ficheiros existentes
  const loadFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/upload?type=${entityType}&id=${entityId}`)
      
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      } else {
        throw new Error('Erro ao carregar ficheiros')
      }
    } catch (error) {
      console.error('Erro ao carregar ficheiros:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os ficheiros",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId, toast])

  // Carregar ficheiros ao montar o componente
  React.useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // Fazer upload de ficheiro
  const handleFileUpload = async (file: File) => {
    if (!selectedCategory) {
      toast({
        title: "Erro",
        description: "Selecione uma categoria para o ficheiro",
        variant: "destructive"
      })
      return
    }

    if (files.length >= maxFiles) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${maxFiles} ficheiros permitidos`,
        variant: "destructive"
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('categoria', selectedCategory)
      formData.append('descricao', description)
      formData.append(`${entityType}Id`, entityId.toString())

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Sucesso",
          description: "Ficheiro carregado com sucesso",
        })
        
        // Recarregar lista de ficheiros
        await loadFiles()
        
        // Limpar formulário
        setSelectedCategory('')
        setDescription('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        onFileUploaded?.()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro no upload')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Eliminar ficheiro
  const handleDeleteFile = async (fileId: number) => {
    try {
      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Ficheiro eliminado com sucesso",
        })
        await loadFiles()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao eliminar ficheiro')
      }
    } catch (error) {
      console.error('Erro ao eliminar ficheiro:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao eliminar ficheiro",
        variant: "destructive"
      })
    }
  }

  // Obter ícone para tipo de ficheiro
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  // Formatar tamanho do ficheiro
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Gestão de Ficheiros - {entityName}
        </CardTitle>
        <CardDescription>
          Faça upload de documentos, imagens e ficheiros técnicos relacionados com {entityName.toLowerCase()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Formulário de Upload */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {CATEGORIA_LABELS[categoria as keyof typeof CATEGORIA_LABELS]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do ficheiro..."
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Ficheiro *</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file)
                }
              }}
              disabled={isUploading || !selectedCategory}
            />
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>A carregar ficheiro...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </div>

        {/* Lista de Ficheiros */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Ficheiros ({files.length}/{maxFiles})
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadFiles}
              disabled={isLoading}
            >
              Atualizar
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">A carregar ficheiros...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum ficheiro carregado ainda</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file.tipoMime)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.nomeOriginal}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge className={CATEGORIA_COLORS[file.categoria as keyof typeof CATEGORIA_COLORS]}>
                          {CATEGORIA_LABELS[file.categoria as keyof typeof CATEGORIA_LABELS]}
                        </Badge>
                        <span>{formatFileSize(file.tamanho)}</span>
                        <span>{new Date(file.criadoEm).toLocaleDateString('pt-PT')}</span>
                      </div>
                      {file.descricao && (
                        <p className="text-sm text-gray-600 mt-1">{file.descricao}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.tipoMime.startsWith('image/') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{file.nomeOriginal}</DialogTitle>
                            <DialogDescription>
                              Pré-visualização da imagem
                            </DialogDescription>
                          </DialogHeader>
                          <div className="max-h-96 overflow-auto">
                            <img 
                              src={`/${file.caminho.replace('public/', '')}`}
                              alt={file.nomeOriginal}
                              className="w-full h-auto"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/${file.caminho.replace('public/', '')}`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 