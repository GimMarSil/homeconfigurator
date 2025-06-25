import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth-middleware'

// GET /api/edificios - Listar edifícios (filtrando por cliente se não for super admin)
export async function GET(request: NextRequest) {
  // Verificar autenticação
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user // Retorna erro de autorização
  }

  try {
    const { searchParams } = new URL(request.url)
    const clienteIdParam = searchParams.get('clienteId')

    // Determinar filtro de cliente baseado no utilizador
    let clienteFilter = {}
    
    if (user.role === 'super_admin') {
      // Super admin pode filtrar por qualquer cliente ou ver todos
      if (clienteIdParam) {
        clienteFilter = { clienteId: parseInt(clienteIdParam) }
      }
    } else {
      // Utilizadores normais só podem ver edifícios do seu cliente
      clienteFilter = { clienteId: user.clienteId }
    }

    const edificios = await prisma.edificio.findMany({
      where: clienteFilter,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        zonasEspecificas: {
          include: {
            zonaTipo: {
              select: {
                id: true,
                nome: true,
                categoria: true,
              },
            },
            materiaisSelecionados: {
              include: {
                material: {
                  select: {
                    id: true,
                    nome: true,
                    precoUnitario: true,
                  },
                },
              },
            },
          },
        },
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

    return NextResponse.json(edificios)
  } catch (error) {
    console.error('Erro ao buscar edifícios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/edificios - Criar novo edifício
export async function POST(request: NextRequest) {
  // Verificar autenticação
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user // Retorna erro de autorização
  }

  try {
    const body = await request.json()
    const {
      nome,
      morada,
      tipologia,
      nPisos,
      areaBruta,
      anoConstrucao,
      plantaImagem,
      estado,
      clienteId,
    } = body

    // Validações básicas
    if (!nome || !morada || !clienteId) {
      return NextResponse.json(
        { error: 'Nome, morada e cliente são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar autorização para criar edifício para este cliente
    if (user.role !== 'super_admin' && user.clienteId !== parseInt(clienteId)) {
      return NextResponse.json(
        { error: 'Não tem permissão para criar edifícios para este cliente' },
        { status: 403 }
      )
    }

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(clienteId) },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 400 }
      )
    }

    const novoEdificio = await prisma.edificio.create({
      data: {
        nome,
        morada,
        tipologia: tipologia || null,
        nPisos: parseInt(nPisos) || 1,
        areaBruta: parseFloat(areaBruta) || null,
        anoConstrucao: parseInt(anoConstrucao) || null,
        plantaImagem: plantaImagem || null,
        estado: estado || 'EM_CURSO',
        clienteId: parseInt(clienteId),
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        zonasEspecificas: {
          include: {
            zonaTipo: true,
          },
        },
      },
    })

    return NextResponse.json(novoEdificio, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar edifício:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 