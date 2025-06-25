import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

// Configurações de upload
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed'
]

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]

// Mapeamento de categorias para pastas
const CATEGORY_FOLDERS = {
  PLANTA_EDIFICIO: 'edificios',
  DESENHO_TECNICO: 'tecnicos',
  DOCUMENTO_LEGAL: 'legais',
  FOTO_ZONA: 'zonas',
  FICHA_TECNICA: 'fichas',
  IMAGEM_MATERIAL: 'materiais',
  CERTIFICACAO: 'certificacoes',
  MANUAL_INSTALACAO: 'manuais',
  GARANTIA: 'garantias',
  OUTROS: 'outros'
}

// POST /api/upload - Upload ficheiro
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const categoria = formData.get('categoria') as string
    const descricao = formData.get('descricao') as string
    const edificioId = formData.get('edificioId') as string
    const zonaId = formData.get('zonaId') as string
    const materialId = formData.get('materialId') as string
    const comentarioId = formData.get('comentarioId') as string

    if (!file) {
      return NextResponse.json({ error: 'Ficheiro é obrigatório' }, { status: 400 })
    }

    if (!categoria || !CATEGORY_FOLDERS[categoria as keyof typeof CATEGORY_FOLDERS]) {
      return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
    }

    // Validar tipo de ficheiro
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de ficheiro não permitido',
        allowedTypes: ALLOWED_TYPES 
      }, { status: 400 })
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `Ficheiro demasiado grande. Máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 })
    }

    // Verificar permissões baseadas na categoria
    if (edificioId) {
      const edificio = await prisma.edificio.findFirst({
        where: {
          id: parseInt(edificioId),
          clienteId: user.clienteId || undefined
        }
      })
      if (!edificio && user.role !== 'super_admin') {
        return NextResponse.json({ error: 'Acesso negado ao edifício' }, { status: 403 })
      }
    }

    // Criar nome único para o ficheiro
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomSuffix}.${fileExtension}`

    // Determinar pasta baseada na categoria
    const folderName = CATEGORY_FOLDERS[categoria as keyof typeof CATEGORY_FOLDERS]
    const uploadDir = join(process.cwd(), 'public', 'uploads', folderName)
    
    // Criar pasta se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Caminho completo do ficheiro
    const filePath = join(uploadDir, fileName)
    const relativePath = `/uploads/${folderName}/${fileName}`

    // Guardar ficheiro
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Guardar na base de dados
    const ficheiro = await prisma.ficheiro.create({
      data: {
        nomeOriginal: file.name,
        nomeArquivo: fileName,
        caminho: relativePath,
        tamanho: file.size,
        tipoMime: file.type,
        categoria: categoria as any,
        descricao: descricao || null,
        edificioId: edificioId ? parseInt(edificioId) : null,
        zonaId: zonaId ? parseInt(zonaId) : null,
        materialId: materialId ? parseInt(materialId) : null,
        comentarioId: comentarioId ? parseInt(comentarioId) : null
      },
      include: {
        edificio: {
          select: { id: true, nome: true }
        },
        zona: {
          select: { id: true, nome: true }
        },
        material: {
          select: { id: true, nome: true }
        }
      }
    })

    // Criar notificação se for imagem de material
    if (categoria === 'IMAGEM_MATERIAL' && materialId) {
      await prisma.notificacao.create({
        data: {
          titulo: 'Nova imagem de material',
          mensagem: `${user.nome} adicionou uma imagem ao material`,
          tipo: 'DOCUMENTO_ADICIONADO',
          clienteId: user.clienteId!,
          remetenteId: user.id,
          materialId: parseInt(materialId),
          url: `/dashboard/materiais/${materialId}`
        }
      })
    }

    return NextResponse.json({
      message: 'Ficheiro carregado com sucesso',
      ficheiro
    }, { status: 201 })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET /api/upload?type=edificio&id=1 - Listar ficheiros por entidade
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const edificioId = searchParams.get('edificioId')
    const zonaId = searchParams.get('zonaId')
    const materialId = searchParams.get('materialId')
    const comentarioId = searchParams.get('comentarioId')

    const where: any = {}

    // Filtros baseados nos parâmetros
    if (categoria) where.categoria = categoria
    if (edificioId) where.edificioId = parseInt(edificioId)
    if (zonaId) where.zonaId = parseInt(zonaId)
    if (materialId) where.materialId = parseInt(materialId)
    if (comentarioId) where.comentarioId = parseInt(comentarioId)

    // Filtro por cliente (exceto super admin)
    if (user.role !== 'super_admin') {
      where.OR = [
        { edificio: { clienteId: user.clienteId } },
        { zona: { edificio: { clienteId: user.clienteId } } },
        { material: { clienteId: user.clienteId } },
        { comentario: { clienteId: user.clienteId } }
      ]
    }

    const ficheiros = await prisma.ficheiro.findMany({
      where,
      include: {
        edificio: {
          select: { id: true, nome: true }
        },
        zona: {
          select: { id: true, nome: true }
        },
        material: {
          select: { id: true, nome: true }
        }
      },
      orderBy: {
        criadoEm: 'desc'
      }
    })

    return NextResponse.json(ficheiros)

  } catch (error) {
    console.error('Erro ao buscar ficheiros:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 