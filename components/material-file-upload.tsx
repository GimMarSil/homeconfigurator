'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, Award, Wrench, Shield, BookOpen, X, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { useToast } from './ui/use-toast'

interface FileUpload {
  file: File
  categoria: string
  descricao: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface MaterialFileUploadProps {
  materialId: number
  onUploadComplete?: () => void
  className?: string
}

const categories = [
  { value: 'FICHA_TECNICA', label: 'Ficha Técnica', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  { value: 'IMAGEM_MATERIAL', label: 'Imagem do Material', icon: Image, color: 'bg-green-100 text-green-800' },
  { value: 'CERTIFICACAO', label: 'Certificação', icon: Award, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MANUAL_INSTALACAO', label: 'Manual de Instalação', icon: Wrench, color: 'bg-purple-100 text-purple-800' },
  { value: 'GARANTIA', label: 'Garantia', icon: Shield, color: 'bg-red-100 text-red-800' },
  { value: 'DOCUMENTO_LEGAL', label: 'Documento Legal', icon: BookOpen, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'OUTROS', label: 'Outros', icon: FileText, color: 'bg-gray-100 text-gray-800' },
]

export function MaterialFileUpload({ materialId, onUploadComplete, className }: MaterialFileUploadProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [defaultCategory, setDefaultCategory] = useState('')
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: FileUpload[] = acceptedFiles.map(file => ({
      file,
      categoria: defaultCategory || 'OUTROS',
      descricao: '',
      progress: 0,
      status: 'pending'
    }))

    setUploads(prev => [...prev, ...newUploads])
  }, [defaultCategory])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const updateUpload = (index: number, updates: Partial<FileUpload>) => {
    setUploads(prev => prev.map((upload, i) => 
      i === index ? { ...upload, ...updates } : upload
    ))
  }

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFile = async (upload: FileUpload, index: number) => {
    updateUpload(index, { status: 'uploading', progress: 0 })

    try {
      const formData = new FormData()
      formData.append('file', upload.file)
      formData.append('categoria', upload.categoria)
      formData.append('descricao', upload.descricao)

      const xhr = new XMLHttpRequest()

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          updateUpload(index, { progress })
        }
      })

      // Success/Error handling
      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          updateUpload(index, { status: 'success', progress: 100 })
          toast({
            title: "Sucesso",
            description: `Ficheiro "${upload.file.name}" carregado com sucesso!`,
          })
          onUploadComplete?.()
        } else {
          const error = JSON.parse(xhr.responseText)?.error || 'Erro no upload'
          updateUpload(index, { status: 'error', error })
          toast({
            title: "Erro",
            description: error,
            variant: "destructive",
          })
        }
      })

      xhr.addEventListener('error', () => {
        updateUpload(index, { status: 'error', error: 'Erro de conexão' })
        toast({
          title: "Erro",
          description: "Erro de conexão durante o upload",
          variant: "destructive",
        })
      })

      xhr.open('POST', `/api/materiais/${materialId}/ficheiros`)
      xhr.send(formData)

    } catch (error) {
      updateUpload(index, { status: 'error', error: 'Erro inesperado' })
      toast({
        title: "Erro",
        description: "Erro inesperado durante o upload",
        variant: "destructive",
      })
    }
  }

  const uploadAll = async () => {
    const pendingUploads = uploads.filter(upload => upload.status === 'pending')
    
    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status === 'pending') {
        await uploadFile(uploads[i], i)
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  const clearCompleted = () => {
    setUploads(prev => prev.filter(upload => upload.status !== 'success'))
  }

  const getCategoryData = (categoria: string) => {
    return categories.find(cat => cat.value === categoria) || categories[categories.length - 1]
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Ficheiros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categoria padrão */}
        <div className="space-y-2">
          <Label htmlFor="default-category">Categoria Padrão (opcional)</Label>
          <Select value={defaultCategory} onValueChange={setDefaultCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria padrão" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg font-medium">Solte os ficheiros aqui...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                Arraste ficheiros aqui ou clique para seleccionar
              </p>
              <p className="text-sm text-muted-foreground">
                Suporta PDF, Word, Excel, imagens e texto. Máximo 50MB por ficheiro.
              </p>
            </div>
          )}
        </div>

        {/* Lista de uploads */}
        {uploads.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Ficheiros para Upload ({uploads.length})</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={uploadAll} 
                  disabled={!uploads.some(u => u.status === 'pending')}
                  size="sm"
                >
                  Upload Todos
                </Button>
                <Button 
                  onClick={clearCompleted} 
                  variant="outline" 
                  size="sm"
                  disabled={!uploads.some(u => u.status === 'success')}
                >
                  Limpar Concluídos
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {uploads.map((upload, index) => {
                const categoryData = getCategoryData(upload.categoria)
                const Icon = categoryData.icon

                return (
                  <Card key={`${upload.file.name}-${index}`} className="p-4">
                    <div className="space-y-3">
                      {/* Header do ficheiro */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{upload.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(upload.file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={categoryData.color}>
                            {categoryData.label}
                          </Badge>
                          {upload.status === 'success' && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUpload(index)}
                            disabled={upload.status === 'uploading'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Configurações */}
                      {upload.status === 'pending' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select 
                              value={upload.categoria} 
                              onValueChange={(value) => updateUpload(index, { categoria: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => {
                                  const CategoryIcon = category.icon
                                  return (
                                    <SelectItem key={category.value} value={category.value}>
                                      <div className="flex items-center gap-2">
                                        <CategoryIcon className="h-4 w-4" />
                                        {category.label}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Descrição (opcional)</Label>
                            <Input
                              placeholder="Descrição do ficheiro..."
                              value={upload.descricao}
                              onChange={(e) => updateUpload(index, { descricao: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Progress bar */}
                      {upload.status === 'uploading' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>A carregar...</span>
                            <span>{upload.progress}%</span>
                          </div>
                          <Progress value={upload.progress} />
                        </div>
                      )}

                      {/* Error message */}
                      {upload.status === 'error' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Erro:</strong> {upload.error}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => uploadFile(upload, index)}
                          >
                            Tentar Novamente
                          </Button>
                        </div>
                      )}

                      {/* Success message */}
                      {upload.status === 'success' && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            ✓ Ficheiro carregado com sucesso!
                          </p>
                        </div>
                      )}

                      {/* Upload individual button */}
                      {upload.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => uploadFile(upload, index)}
                          className="w-full"
                        >
                          Carregar Este Ficheiro
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 