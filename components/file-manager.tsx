'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  File, 
  Image, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  Building,
  MapPin,
  Package,
  Upload
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FileUpload } from './file-upload'

interface FileManagerProps {
  categoria?: string
  edificioId?: number
  zonaId?: number
  materialId?: number
  comentarioId?: number
  onFileDeleted?: (fileId: number) => void
  showUpload?: boolean
}

interface FileData {
  id: number
  nomeOriginal: string
  nomeArquivo: string
  caminho: string
  tamanho: number
  tipoMime: string
  categoria: string
  descricao: string | null
  criadoEm: string
  edificio?: { id: number; nome: string } | null
  zona?: { id: number; nome: string } | null
  material?: { id: number; nome: string } | null
}

export function FileManager({
  categoria,
  edificioId,
  zonaId,
  materialId,
  comentarioId,
  onFileDeleted,
  showUpload = false
}: FileManagerProps) {
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const { toast } = useToast()

  // Categorias para exibição
  const categoriaLabels = {
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

  const loadFiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (categoria) params.append('categoria', categoria)
      if (edificioId) params.append('edificioId', edificioId.toString())
      if (zonaId) params.append('zonaId', zonaId.toString())
      if (materialId) params.append('materialId', materialId.toString())
      if (comentarioId) params.append('comentarioId', comentarioId.toString())

      const response = await fetch(`/api/upload?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      } else {
        throw new Error('Erro ao carregar ficheiros')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os ficheiros",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [categoria, edificioId, zonaId, materialId, comentarioId])

  const deleteFile = async (fileId: number) => {
    if (!confirm('Tem certeza que deseja eliminar este ficheiro?')) return

    try {
      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        onFileDeleted?.(fileId)
        toast({
          title: "Ficheiro eliminado",
          description: "O ficheiro foi eliminado com sucesso"
        })
      } else {
        throw new Error('Erro ao eliminar ficheiro')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o ficheiro",
        variant: "destructive"
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (file: FileData) => {
    if (file.tipoMime.startsWith('image/')) return Image
    if (file.tipoMime.includes('pdf')) return FileText
    return File
  }

  const isImage = (file: FileData) => {
    return file.tipoMime.startsWith('image/')
  }

  const canPreview = (file: FileData) => {
    return isImage(file) || file.tipoMime.includes('pdf')
  }

  const handleFileUploaded = (newFile: FileData) => {
    setFiles(prev => [newFile, ...prev])
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload de ficheiros */}
      {showUpload && categoria && (
        <FileUpload
          categoria={categoria}
          edificioId={edificioId}
          zonaId={zonaId}
          materialId={materialId}
          comentarioId={comentarioId}
          onUploadComplete={handleFileUploaded}
        />
      )}

      {/* Lista de ficheiros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ficheiros ({files.length})</span>
            {files.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadFiles}
              >
                Atualizar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum ficheiro encontrado</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => {
                const FileIcon = getFileIcon(file)
                return (
                  <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Preview da imagem */}
                    {isImage(file) && (
                      <div className="mb-3 aspect-video bg-muted rounded overflow-hidden">
                        <img
                          src={file.caminho}
                          alt={file.nomeOriginal}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Informações do ficheiro */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FileIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate" title={file.nomeOriginal}>
                            {file.nomeOriginal}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.tamanho)}
                          </p>
                        </div>
                      </div>

                      {/* Categoria */}
                      <Badge variant="secondary" className="text-xs">
                        {categoriaLabels[file.categoria as keyof typeof categoriaLabels] || file.categoria}
                      </Badge>

                      {/* Descrição */}
                      {file.descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {file.descricao}
                        </p>
                      )}

                      {/* Metadados */}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(file.criadoEm)}
                        </div>
                        
                        {file.edificio && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {file.edificio.nome}
                          </div>
                        )}
                        
                        {file.zona && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {file.zona.nome}
                          </div>
                        )}
                        
                        {file.material && (
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {file.material.nome}
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.caminho, '_blank')}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>

                        {canPreview(file) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(file)
                              setPreviewOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedFile?.nomeOriginal}</DialogTitle>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-4">
              {isImage(selectedFile) ? (
                <div className="flex justify-center">
                  <img
                    src={selectedFile.caminho}
                    alt={selectedFile.nomeOriginal}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                </div>
              ) : selectedFile.tipoMime.includes('pdf') ? (
                <iframe
                  src={selectedFile.caminho}
                  className="w-full h-[60vh] border rounded"
                  title={selectedFile.nomeOriginal}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <File className="h-12 w-12 mx-auto mb-4" />
                  <p>Preview não disponível para este tipo de ficheiro</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.tamanho)} • {selectedFile.tipoMime}
                </div>
                <Button onClick={() => window.open(selectedFile.caminho, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 