import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '../../../../../lib/prisma'
import { requireAuth } from '../../../../../lib/auth-middleware'

// GET /api/materiais/[id]/ficheiros - Listar ficheiros do material
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }

  try {
    const { id } = await params
    const materialId = parseInt(id)

    // Verificar se o material existe
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { cliente: true }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    if (user.role !== 'super_admin' && material.clienteId !== user.clienteId) {
      return NextResponse.json(
        { error: 'Não tem permissão para aceder a este material' },
        { status: 403 }
      )
    }

    const ficheiros = await prisma.ficheiro.findMany({
      where: { materialId: materialId },
      orderBy: { criadoEm: 'desc' }
    })

    return NextResponse.json(ficheiros)
  } catch (error) {
    console.error('Erro ao buscar ficheiros do material:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/materiais/[id]/ficheiros - Upload de ficheiros para o material
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }

  try {
    const { id } = await params
    const materialId = parseInt(id)

    // Verificar se o material existe
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { cliente: true }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    if (user.role !== 'super_admin' && material.clienteId !== user.clienteId) {
      return NextResponse.json(
        { error: 'Não tem permissão para adicionar ficheiros a este material' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const categoria = formData.get('categoria') as string
    const descricao = formData.get('descricao') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum ficheiro fornecido' },
        { status: 400 }
      )
    }

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }

    // Validar categoria
    const categoriasValidas = [
      'FICHA_TECNICA',
      'IMAGEM_MATERIAL', 
      'CERTIFICACAO',
      'MANUAL_INSTALACAO',
      'GARANTIA',
      'DOCUMENTO_LEGAL',
      'OUTROS'
    ]

    if (!categoriasValidas.includes(categoria)) {
      return NextResponse.json(
        { error: 'Categoria inválida' },
        { status: 400 }
      )
    }

    // Verificar tamanho do ficheiro (50MB máximo)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ficheiro muito grande. Máximo 50MB' },
        { status: 400 }
      )
    }

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materiais')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Gerar nome único para o ficheiro
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const nomeArquivo = `material_${materialId}_${timestamp}_${randomString}${extension}`
    const caminhoCompleto = path.join(uploadDir, nomeArquivo)

    // Salvar ficheiro
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(caminhoCompleto, buffer)

    // Salvar informações na base de dados
    const novoFicheiro = await prisma.ficheiro.create({
      data: {
        nomeOriginal: file.name,
        nomeArquivo: nomeArquivo,
        caminho: `/uploads/materiais/${nomeArquivo}`,
        tamanho: file.size,
        tipoMime: file.type,
        categoria: categoria as any,
        descricao: descricao || null,
        materialId: materialId,
      }
    })

    return NextResponse.json(novoFicheiro, { status: 201 })
  } catch (error) {
    console.error('Erro ao fazer upload do ficheiro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 