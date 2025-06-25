import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth-middleware'

// GET /api/tipos-material - Listar todos os tipos de material (requer autenticação)
export async function GET(request: NextRequest) {
  // Verificar autenticação
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user // Retorna erro de autorização
  }

  try {
    const tiposMaterial = await prisma.tipoMaterial.findMany({
      include: {
        _count: {
          select: {
            materiais: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    })

    return NextResponse.json(tiposMaterial)
  } catch (error) {
    console.error('Erro ao buscar tipos de material:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/tipos-material - Criar novo tipo de material (apenas administradores)
export async function POST(request: NextRequest) {
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }

  // Verificar se é administrador
  if (!['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem criar tipos de material.' },
      { status: 403 }
    )
  }

  try {
    const { nome, unidadeMedida, descricao } = await request.json()

    if (!nome || !unidadeMedida) {
      return NextResponse.json(
        { error: 'Nome e unidade de medida são obrigatórios' },
        { status: 400 }
      )
    }

    const novoTipo = await prisma.tipoMaterial.create({
      data: {
        nome,
        unidadeMedida,
        descricao,
      },
    })

    return NextResponse.json(novoTipo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tipo de material:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 