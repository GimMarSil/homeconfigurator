'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface ImageFile {
  src: string
  alt: string
  description?: string
}

interface MaterialImageCarouselProps {
  materialId?: number
  materialName?: string
  images?: ImageFile[]
  className?: string
}

interface ApiImageFile {
  id: number
  nomeOriginal: string
  caminho: string
  tamanho: number
}

export function MaterialImageCarousel({ materialId, materialName, images: propImages, className }: MaterialImageCarouselProps) {
  const [images, setImages] = useState<ImageFile[]>(propImages || [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(!!materialId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (propImages) {
      setImages(propImages)
      setIsLoading(false)
    } else if (materialId) {
      fetchImages()
    }
  }, [materialId, propImages])

  const fetchImages = async () => {
    if (!materialId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/materiais/${materialId}/ficheiros`)
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Não autorizado - verifique o login')
        } else if (response.status === 404) {
          throw new Error('Material não encontrado')
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
      }
      
      const ficheiros = await response.json()
      
      // Filtrar apenas imagens
      const imageFiles = ficheiros.filter((file: any) => 
        file.categoria === 'IMAGEM_MATERIAL' && 
        file.tipoMime?.startsWith('image/')
      )
      
      // Converter para formato padrão
      const formattedImages: ImageFile[] = imageFiles.map((file: ApiImageFile) => ({
        src: file.caminho,
        alt: file.nomeOriginal,
        description: file.nomeOriginal
      }))
      
      setImages(formattedImages)
      setCurrentIndex(0)
    } catch (error) {
      console.error('Erro ao buscar imagens:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar imagens')
    } finally {
      setIsLoading(false)
    }
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  if (isLoading) {
    return (
      <div className={cn("w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center", className)}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || images.length === 0) {
    return (
      <div className={cn("w-full h-32 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400", className)}>
        <ImageIcon className="h-8 w-8 mb-2" />
        <span className="text-xs text-center">
          {error || 'Sem imagens'}
        </span>
      </div>
    )
  }

  const currentImage = images[currentIndex]

  return (
    <div className={cn("relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group", className)}>
      {/* Imagem atual */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="max-w-full max-h-full object-contain transition-opacity duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.jpg'
          }}
        />
      </div>

      {/* Sobreposição com controles (visível no hover) */}
      {images.length > 1 && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-between px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              prevImage()
            }}
            className="h-8 w-8 p-0 rounded-full bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              nextImage()
            }}
            className="h-8 w-8 p-0 rounded-full bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Indicadores de posição */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-white"
                  : "bg-white bg-opacity-50"
              )}
            />
          ))}
        </div>
      )}

      {/* Contador de imagens */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
} 