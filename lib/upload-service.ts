import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { prisma } from './prisma'

export interface UploadResult {
  success: boolean
  fileId?: number
  fileName?: string
  filePath?: string
  error?: string
}

export interface FileUploadData {
  file: File
  categoria: 'PLANTA_EDIFICIO' | 'DESENHO_TECNICO' | 'DOCUMENTO_LEGAL' | 'FOTO_ZONA' | 
            'FICHA_TECNICA' | 'IMAGEM_MATERIAL' | 'CERTIFICACAO' | 'MANUAL_INSTALACAO' | 
            'GARANTIA' | 'OUTROS'
  descricao?: string
  edificioId?: number
  zonaId?: number
  materialId?: number
}

// Configurações de upload
const UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    drawings: ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf', 'image/svg+xml'],
    technical: ['application/pdf', 'text/plain', 'application/json']
  },
  uploadDir: 'public/uploads'
}

// Validar tipo de ficheiro baseado na categoria
function validateFileType(mimeType: string, categoria: string): boolean {
  switch (categoria) {
    case 'PLANTA_EDIFICIO':
    case 'DESENHO_TECNICO':
      return [...UPLOAD_CONFIG.allowedTypes.images, ...UPLOAD_CONFIG.allowedTypes.documents, ...UPLOAD_CONFIG.allowedTypes.drawings].includes(mimeType)
    
    case 'FOTO_ZONA':
    case 'IMAGEM_MATERIAL':
      return UPLOAD_CONFIG.allowedTypes.images.includes(mimeType)
    
    case 'FICHA_TECNICA':
    case 'CERTIFICACAO':
    case 'MANUAL_INSTALACAO':
    case 'GARANTIA':
    case 'DOCUMENTO_LEGAL':
      return [...UPLOAD_CONFIG.allowedTypes.documents, ...UPLOAD_CONFIG.allowedTypes.technical].includes(mimeType)
    
    case 'OUTROS':
      return true // Permite qualquer tipo para "outros"
    
    default:
      return false
  }
}

// Gerar nome único para o ficheiro
function generateUniqueFileName(originalName: string): string {
  const extension = originalName.split('.').pop()
  const uniqueId = randomUUID()
  return `${uniqueId}.${extension}`
}

// Criar diretório se não existir
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    // Diretório pode já existir
  }
}

// Upload principal
export async function uploadFile(data: FileUploadData): Promise<UploadResult> {
  try {
    const { file, categoria, descricao, edificioId, zonaId, materialId } = data

    // Validações básicas
    if (!file || file.size === 0) {
      return { success: false, error: 'Ficheiro não fornecido ou vazio' }
    }

    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return { success: false, error: `Ficheiro muito grande. Máximo: ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB` }
    }

    if (!validateFileType(file.type, categoria)) {
      return { success: false, error: `Tipo de ficheiro não permitido para a categoria ${categoria}` }
    }

    // Validar que pelo menos uma entidade está associada
    if (!edificioId && !zonaId && !materialId) {
      return { success: false, error: 'É necessário associar o ficheiro a pelo menos uma entidade (edifício, zona ou material)' }
    }

    // Gerar nome único e caminho
    const uniqueFileName = generateUniqueFileName(file.name)
    
    // Criar estrutura de diretórios baseada na categoria
    let categoryDir: string
    switch (categoria) {
      case 'PLANTA_EDIFICIO':
      case 'DESENHO_TECNICO':
        categoryDir = 'edificios'
        break
      case 'FOTO_ZONA':
        categoryDir = 'zonas'
        break
      case 'FICHA_TECNICA':
      case 'IMAGEM_MATERIAL':
      case 'CERTIFICACAO':
        categoryDir = 'materiais'
        break
      default:
        categoryDir = 'outros'
    }

    const uploadPath = join(UPLOAD_CONFIG.uploadDir, categoryDir)
    await ensureDirectory(uploadPath)

    const filePath = join(uploadPath, uniqueFileName)
    const fullPath = join(process.cwd(), filePath)

    // Converter File para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Escrever ficheiro
    await writeFile(fullPath, buffer)

    // Guardar na base de dados
    const ficheiro = await prisma.ficheiro.create({
      data: {
        nomeOriginal: file.name,
        nomeArquivo: uniqueFileName,
        caminho: filePath.replace(/\\/g, '/'), // Normalizar separadores
        tamanho: file.size,
        tipoMime: file.type,
        categoria: categoria as any,
        descricao,
        edificioId,
        zonaId,
        materialId
      }
    })

    return {
      success: true,
      fileId: ficheiro.id,
      fileName: uniqueFileName,
      filePath: filePath.replace(/\\/g, '/')
    }

  } catch (error) {
    console.error('Erro no upload:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido no upload' 
    }
  }
}

// Listar ficheiros por entidade
export async function getFilesByEntity(type: 'edificio' | 'zona' | 'material', entityId: number) {
  const whereClause = type === 'edificio' 
    ? { edificioId: entityId }
    : type === 'zona' 
    ? { zonaId: entityId }
    : { materialId: entityId }

  return await prisma.ficheiro.findMany({
    where: whereClause,
    orderBy: { criadoEm: 'desc' }
  })
}

// Eliminar ficheiro
export async function deleteFile(fileId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const ficheiro = await prisma.ficheiro.findUnique({
      where: { id: fileId }
    })

    if (!ficheiro) {
      return { success: false, error: 'Ficheiro não encontrado' }
    }

    // Eliminar da base de dados primeiro
    await prisma.ficheiro.delete({
      where: { id: fileId }
    })

    // Tentar eliminar o ficheiro físico (não crítico se falhar)
    try {
      const fs = require('fs').promises
      const fullPath = join(process.cwd(), ficheiro.caminho)
      await fs.unlink(fullPath)
    } catch (fsError) {
      console.warn('Aviso: Não foi possível eliminar o ficheiro físico:', fsError)
      // Não falhar a operação se o ficheiro físico não puder ser eliminado
    }

    return { success: true }

  } catch (error) {
    console.error('Erro ao eliminar ficheiro:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }
  }
}

// Obter URL pública do ficheiro
export function getFileUrl(filePath: string): string {
  // Remove 'public/' do início do caminho se existir
  const publicPath = filePath.startsWith('public/') ? filePath.substring(7) : filePath
  return `/${publicPath}`
}

// Validar se o utilizador tem permissão para aceder ao ficheiro
export async function validateFileAccess(fileId: number, userRole: string, userClientId?: number): Promise<boolean> {
  // Super admin tem acesso a tudo
  if (userRole === 'super_admin') {
    return true
  }

  const ficheiro = await prisma.ficheiro.findUnique({
    where: { id: fileId },
    include: {
      edificio: {
        select: { clienteId: true }
      },
      zona: {
        include: {
          edificio: {
            select: { clienteId: true }
          }
        }
      }
    }
  })

  if (!ficheiro) {
    return false
  }

  // Para utilizadores normais, verificar se o ficheiro pertence ao seu cliente
  if (userClientId) {
    const clienteId = ficheiro.edificio?.clienteId || ficheiro.zona?.edificio?.clienteId
    return clienteId === userClientId
  }

  // Administradores têm acesso a tudo
  return ['admin'].includes(userRole)
} 