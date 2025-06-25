import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth-middleware'

// GET /api/zonas-tipo - Listar todos os tipos de zona (requer autenticação)
export async function GET(request: NextRequest) {
  // Verificar autenticação
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user // Retorna erro de autorização
  }

  try {
    const zonasTipo = await prisma.zonaTipo.findMany({
      include: {
        _count: {
          select: {
            zonasEspecificas: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    })

    return NextResponse.json(zonasTipo)
  } catch (error) {
    console.error('Erro ao buscar tipos de zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/zonas-tipo - Criar novo tipo de zona (apenas administradores)
export async function POST(request: NextRequest) {
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }

  // Verificar se é administrador
  if (!['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem criar tipos de zona.' },
      { status: 403 }
    )
  }

  try {
    const { nome, descricao } = await request.json()

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const novoTipo = await prisma.zonaTipo.create({
      data: {
        nome,
        descricao,
      },
    })

    return NextResponse.json(novoTipo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar tipo de zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 