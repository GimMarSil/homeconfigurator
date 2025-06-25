import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

// GET /api/materiais - Listar materiais (globais + do cliente)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const disponivel = searchParams.get('disponivel')
    const tipoMaterialId = searchParams.get('tipoMaterialId')
    const apenasPersonalizados = searchParams.get('apenasPersonalizados') === 'true'
    const apenasGlobais = searchParams.get('apenasGlobais') === 'true'
    const incluirPendentes = searchParams.get('incluirPendentes') === 'true'

    const filters: any = {}

    // Filtros básicos
    if (categoria) {
      filters.tipoMaterial = {
        categoria: {
          contains: categoria,
          mode: 'insensitive'
        }
      }
    }

    if (tipoMaterialId) {
      filters.tipoMaterialId = parseInt(tipoMaterialId)
    }

    if (disponivel !== null) {
      filters.disponivel = disponivel === 'true'
    }

    // Filtros de acesso baseados no utilizador
    if (apenasPersonalizados) {
      // Apenas materiais do cliente
      filters.clienteId = user.clienteId
      filters.isGlobal = false
    } else if (apenasGlobais) {
      // Apenas materiais globais
      filters.isGlobal = true
      filters.aprovado = true
    } else {
      // Materiais globais + do cliente
      if (user.clienteId) {
        filters.OR = [
          { isGlobal: true, aprovado: true }, // Materiais globais aprovados
          { clienteId: user.clienteId } // Materiais do cliente
        ]
      } else if (user.role !== 'super_admin') {
        // Utilizador sem cliente só vê globais
        filters.isGlobal = true
        filters.aprovado = true
      }
    }

    // Filtro de aprovação para admins
    if (!incluirPendentes && user.role !== 'super_admin') {
      if (filters.OR) {
        filters.OR[1].aprovado = true // Apenas materiais personalizados aprovados
      } else if (!filters.isGlobal) {
        filters.aprovado = true
      }
    }

    const materiais = await prisma.material.findMany({
      where: filters,
      include: {
        tipoMaterial: true,
        cliente: {
          select: {
            id: true,
            nome: true
          }
        },
        ficheiros: {
          select: {
            id: true,
            nomeOriginal: true,
            caminho: true,
            categoria: true,
            tamanho: true
          }
        }
      },
      orderBy: [
        { isGlobal: 'desc' }, // Globais primeiro
        { aprovado: 'desc' }, // Aprovados primeiro
        { nome: 'asc' }
      ]
    })

    return NextResponse.json(materiais)
    
  } catch (error) {
    console.error('Erro ao buscar materiais:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/materiais - Criar novo material
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const body = await request.json()
    const {
      nome,
      referencia,
      marca,
      descricao,
      precoUnitario,
      fornecedor,
      urlFabricante,
      imagem,
      fichaTecnica,
      tipoMaterialId,
      isGlobal = false
    } = body

    // Validações básicas
    if (!nome || !tipoMaterialId) {
      return NextResponse.json({ error: 'Nome e tipo de material são obrigatórios' }, { status: 400 })
    }

    // Verificar se tipo de material existe
    const tipoMaterial = await prisma.tipoMaterial.findUnique({
      where: { id: parseInt(tipoMaterialId) }
    })

    if (!tipoMaterial) {
      return NextResponse.json({ error: 'Tipo de material não encontrado' }, { status: 400 })
    }

    // Apenas super admins podem criar materiais globais
    const materialGlobal = isGlobal && user.role === 'super_admin'
    
    // Clientes precisam ter clienteId para criar materiais personalizados
    if (!materialGlobal && !user.clienteId) {
      return NextResponse.json({ error: 'Utilizador deve estar associado a um cliente' }, { status: 400 })
    }

    const novoMaterial = await prisma.material.create({
      data: {
        nome,
        referencia: referencia || null,
        marca: marca || null,
        descricao: descricao || null,
        precoUnitario: parseFloat(precoUnitario) || 0,
        fornecedor: fornecedor || null,
        urlFabricante: urlFabricante || null,
        imagem: imagem || null,
        fichaTecnica: fichaTecnica || null,
        disponivel: true,
        tipoMaterialId: parseInt(tipoMaterialId),
        isGlobal: materialGlobal,
        aprovado: materialGlobal, // Materiais globais são automaticamente aprovados
        clienteId: materialGlobal ? null : user.clienteId
      },
      include: {
        tipoMaterial: true,
        cliente: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    // Criar notificação para admin se for material personalizado
    if (!materialGlobal && user.clienteId) {
      await prisma.notificacao.create({
        data: {
          titulo: 'Novo material personalizado',
          mensagem: `${user.name} criou um novo material: ${nome}`,
          tipo: 'DOCUMENTO_ADICIONADO',
          clienteId: user.clienteId,
          remetenteId: user.id,
          url: `/dashboard/materiais/${novoMaterial.id}`
        }
      })
    }

    return NextResponse.json(novoMaterial, { status: 201 })
    
  } catch (error) {
    console.error('Erro ao criar material:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 