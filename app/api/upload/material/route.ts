import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { materialId, url, categoria, descricao } = await request.json()

    if (!materialId || !url) {
      return NextResponse.json({ error: 'Material ID e URL são obrigatórios' }, { status: 400 })
    }

    // Verificar se o material existe
    const material = await prisma.materiais.findUnique({
      where: { id: parseInt(materialId) }
    })

    if (!material) {
      return NextResponse.json({ error: 'Material não encontrado' }, { status: 404 })
    }

    console.log('📥 Fazendo download de:', url)

    // Fazer download do ficheiro
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Erro ao fazer download: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // Determinar extensão baseada no content-type ou URL
    let extension = 'bin'
    if (contentType.includes('image/')) {
      extension = contentType.split('/')[1]
    } else if (url.includes('.pdf')) {
      extension = 'pdf'
    } else if (url.includes('.zip')) {
      extension = 'zip'
    } else if (url.includes('.doc')) {
      extension = 'doc'
    } else if (url.includes('.xls')) {
      extension = 'xls'
    }

    // Gerar nome único para o ficheiro
    const fileName = `material_${materialId}_${Date.now()}_${uuidv4()}.${extension}`
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'materiais', fileName)
    
    // Garantir que o diretório existe
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Salvar ficheiro
    fs.writeFileSync(filePath, Buffer.from(buffer))
    
    // Calcular tamanho do ficheiro
    const stats = fs.statSync(filePath)
    const fileSize = stats.size

    // Salvar na base de dados
    const ficheiro = await prisma.ficheiros.create({
      data: {
        nomeOriginal: url.split('/').pop() || fileName,
        nomeArquivo: fileName,
        caminho: `/uploads/materiais/${fileName}`,
        tamanho: fileSize,
        tipoMime: contentType,
        categoria: categoria || 'outros',
        descricao: descricao || '',
        materialId: parseInt(materialId),
      }
    })

    console.log('✅ Ficheiro salvo:', fileName)

    return NextResponse.json({
      success: true,
      data: ficheiro,
      message: 'Ficheiro carregado com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error)
    return NextResponse.json({ 
      error: 'Erro ao fazer upload do ficheiro',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 