"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { MaterialFileUpload } from './material-file-upload'
import { Download, FileText } from 'lucide-react'
import { MaterialImageCarousel } from './material-image-carousel'

interface MaterialFile {
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

// Duas versões do componente: uma para ficheiros apenas, outra para material completo
interface MaterialGallerySimpleProps {
  ficheiros: MaterialFile[]
  material?: any
}

interface MaterialGalleryFullProps {
  material: {
    id: number
    nome: string
    marca?: string
    referencia?: string
    descricao?: string
    precoUnitario: number
    fornecedor?: string
    urlFabricante?: string
    aprovado: boolean
    tipoMaterial: {
      nome: string
      unidadeMedida: string
    }
    ficheiros: MaterialFile[]
  }
  onApprove?: (materialId: number) => void
  onReject?: (materialId: number, reason: string) => void
  onComment?: (materialId: number, comment: string) => void
  onFilesUpdated?: () => void
  canApprove?: boolean
  canUpload?: boolean
}

type MaterialGalleryProps = MaterialGallerySimpleProps | MaterialGalleryFullProps

function isFullProps(props: MaterialGalleryProps): props is MaterialGalleryFullProps {
  return 'material' in props && props.material && 'ficheiros' in props.material
}

export function MaterialGallery(props: MaterialGalleryProps) {
  console.log('📋 MaterialGallery recebeu props:', props)
  
  // Determinar se temos ficheiros diretos ou através do material
  const ficheiros = isFullProps(props) ? props.material.ficheiros : (props.ficheiros || [])
  const material = isFullProps(props) ? props.material : (props.material || null)
  
  console.log('📁 Ficheiros processados:', ficheiros)
  
  // Separar imagens e documentos
  const imagens = ficheiros.filter(f => 
    f.categoria === 'IMAGEM_MATERIAL' || 
    f.tipoMime?.startsWith('image/')
  )
  
  const documentos = ficheiros.filter(f => 
    f.tipoMime === 'application/pdf' || 
    f.categoria === 'FICHA_TECNICA' ||
    f.categoria === 'GARANTIA' ||
    f.categoria === 'MANUAL_INSTALACAO'
  )

  const outrosFicheiros = ficheiros.filter(f => 
    !imagens.includes(f) && !documentos.includes(f)
  )

  console.log('🖼️ Imagens encontradas:', imagens.length)
  console.log('📄 Documentos encontrados:', documentos.length)
  console.log('📁 Outros ficheiros:', outrosFicheiros.length)

  if (!ficheiros || ficheiros.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Nenhum ficheiro associado a este material.</p>
        {material && isFullProps(props) && (
          <MaterialFileUpload 
            materialId={material.id} 
            onUploadComplete={() => window.location.reload()} 
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Informações do Material (se disponível) */}
      {material && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {material.nome}
              <Badge variant={material.disponivel ? "default" : "secondary"}>
                {material.disponivel ? "Disponível" : "Indisponível"}
              </Badge>
            </CardTitle>
            <CardDescription>
              {material.marca} • {material.tipoMaterial?.nome} • Ref: {material.referencia || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Preço:</span> €{material.precoUnitario || 0}
              </div>
              <div>
                <span className="font-medium">Fornecedor:</span> {material.fornecedor}
              </div>
              <div>
                <span className="font-medium">Estado:</span> 
                <Badge variant={material.aprovado ? "default" : "outline"} className="ml-2">
                  {material.aprovado ? "Aprovado" : "Pendente"}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Total Ficheiros:</span> {ficheiros.length}
              </div>
            </div>
            {material.descricao && (
              <div className="mt-4">
                <span className="font-medium">Descrição:</span>
                <p className="text-gray-600 mt-1">{material.descricao}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Carrossel de imagens */}
      {imagens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Galeria de Imagens ({imagens.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <MaterialImageCarousel 
              images={imagens.map(img => ({
                src: img.caminho,
                alt: img.nomeOriginal,
                description: img.descricao
              }))} 
            />
          </CardContent>
        </Card>
      )}

      {/* Documentos PDF */}
      {documentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documentos ({documentos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentos.map(doc => (
                <Card key={doc.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {doc.nomeOriginal}
                    </CardTitle>
                    <CardDescription>{doc.descricao}</CardDescription>
                    <div className="flex gap-2">
                      <Badge variant="outline">{doc.categoria.replace('_', ' ')}</Badge>
                      <Badge variant="secondary">PDF</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {(doc.tamanho / 1024).toFixed(1)} KB
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.caminho} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Descarregar
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outros ficheiros */}
      {outrosFicheiros.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outros Ficheiros ({outrosFicheiros.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outrosFicheiros.map(file => (
                <Card key={file.id}>
                  <CardHeader>
                    <CardTitle className="text-sm">{file.nomeOriginal}</CardTitle>
                    <CardDescription>{file.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline">{file.categoria}</Badge>
                        <Badge variant="secondary">{file.tipoMime}</Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.caminho} target="_blank" rel="noopener noreferrer">
                          Descarregar
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload de novos ficheiros (apenas se for a versão completa) */}
      {material && isFullProps(props) && props.canUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Ficheiros</CardTitle>
          </CardHeader>
          <CardContent>
            <MaterialFileUpload 
              materialId={material.id} 
              onUploadComplete={() => props.onFilesUpdated?.()} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
} 