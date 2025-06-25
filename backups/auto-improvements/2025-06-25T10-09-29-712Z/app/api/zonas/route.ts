import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth-middleware'

// GET /api/zonas - Listar zonas específicas (filtrando por cliente)
export async function GET(request: NextRequest) {
  // Verificar autenticação
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user // Retorna erro de autorização
  }

  try {
    const { searchParams } = new URL(request.url)
    const edificioIdParam = searchParams.get('edificioId')
    const zonaTipoIdParam = searchParams.get('zonaTipoId')

    // Construir filtros baseados no utilizador
    let whereCondition: any = {}

    if (user.role === 'super_admin') {
      // Super admin pode filtrar por qualquer edifício/zona
      if (edificioIdParam) {
        whereCondition.edificioId = parseInt(edificioIdParam)
      }
      if (zonaTipoIdParam) {
        whereCondition.zonaTipoId = parseInt(zonaTipoIdParam)
      }
    } else {
      // Utilizadores normais só podem ver zonas dos edifícios do seu cliente
      whereCondition.edificio = { clienteId: user.clienteId }
      
      if (edificioIdParam) {
        whereCondition.edificioId = parseInt(edificioIdParam)
      }
      if (zonaTipoIdParam) {
        whereCondition.zonaTipoId = parseInt(zonaTipoIdParam)
      }
    }

    const zonas = await prisma.zonaEspecifica.findMany({
      where: whereCondition,
      include: {
        zonaTipo: {
          select: {
            id: true,
            nome: true,
            categoria: true,
            descricao: true,
          },
        },
        edificio: {
          select: {
            id: true,
            nome: true,
            morada: true,
            cliente: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        materiaisSelecionados: {
          include: {
            material: {
              select: {
                id: true,
                nome: true,
                marca: true,
                precoUnitario: true,
                imagem: true,
                tipoMaterial: {
                  select: {
                    nome: true,
                    unidadeMedida: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            materiaisSelecionados: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    })

    return NextResponse.json(zonas)
  } catch (error) {
    console.error('Erro ao buscar zonas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/zonas - Criar nova zona específica
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
      area,
      estado,
      zonaTipoId,
      edificioId,
    } = body

    // Validações básicas
    if (!nome || !area || !zonaTipoId || !edificioId) {
      return NextResponse.json(
        { error: 'Nome, área, tipo de zona e edifício são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se edifício existe e se o utilizador tem acesso
    const edificio = await prisma.edificio.findUnique({
      where: { id: parseInt(edificioId) },
      include: { cliente: true }
    })

    if (!edificio) {
      return NextResponse.json(
        { error: 'Edifício não encontrado' },
        { status: 400 }
      )
    }

    // Verificar autorização para criar zona neste edifício
    if (user.role !== 'super_admin' && edificio.clienteId !== user.clienteId) {
      return NextResponse.json(
        { error: 'Não tem permissão para criar zonas neste edifício' },
        { status: 403 }
      )
    }

    // Verificar se tipo de zona existe
    const zonaTipo = await prisma.zonaTipo.findUnique({
      where: { id: parseInt(zonaTipoId) },
    })

    if (!zonaTipo) {
      return NextResponse.json(
        { error: 'Tipo de zona não encontrado' },
        { status: 400 }
      )
    }

    const novaZona = await prisma.zonaEspecifica.create({
      data: {
        nome,
        area: parseFloat(area),
        estado: estado || 'PENDENTE',
        zonaTipoId: parseInt(zonaTipoId),
        edificioId: parseInt(edificioId),
      },
      include: {
        zonaTipo: true,
        edificio: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
        materiaisSelecionados: {
          include: {
            material: true,
          },
        },
      },
    })

    return NextResponse.json(novaZona, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 