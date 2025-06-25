import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// GET /api/zonas/[id]/materiais - Listar materiais selecionados na zona
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const zonaId = parseInt(resolvedParams.id)

    if (isNaN(zonaId)) {
      return NextResponse.json(
        { error: 'ID de zona inválido' },
        { status: 400 }
      )
    }

    // Verificar se zona existe
    const zona = await prisma.zonaEspecifica.findUnique({
      where: { id: zonaId },
      include: {
        zonaTipo: {
          select: {
            id: true,
            nome: true,
            categoria: true,
          },
        },
      },
    })

    if (!zona) {
      return NextResponse.json(
        { error: 'Zona não encontrada' },
        { status: 404 }
      )
    }

    // Buscar materiais selecionados
    const materiaisSelecionados = await prisma.materialSelecionado.findMany({
      where: { zonaId },
      include: {
        material: {
          include: {
            tipoMaterial: {
              select: {
                nome: true,
                categoria: true,
                unidadeMedida: true,
              },
            },
            ficheiros: {
              orderBy: { criadoEm: 'desc' }
            },
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    })

    // Buscar materiais disponíveis para esta zona (baseado no tipo de zona)
    const materiaisDisponiveis = await prisma.zonaTipoMaterial.findMany({
      where: {
        zonaTipoId: zona.zonaTipoId,
      },
      include: {
        material: {
          include: {
            tipoMaterial: {
              select: {
                nome: true,
                categoria: true,
                unidadeMedida: true,
              },
            },
            ficheiros: {
              orderBy: { criadoEm: 'desc' }
            },
          },
        },
      },
    })

    // Filtrar materiais que estão disponíveis e não são null
    const materiaisFiltrados = materiaisDisponiveis
      .filter(zm => zm.material !== null && zm.material.disponivel)
      .map(zm => zm.material)

    return NextResponse.json({
      zona,
      materiaisSelecionados,
      materiaisDisponiveis: materiaisFiltrados,
    })
  } catch (error) {
    console.error('Erro ao buscar materiais da zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/zonas/[id]/materiais - Adicionar material à zona
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const zonaId = parseInt(resolvedParams.id)

    if (isNaN(zonaId)) {
      return NextResponse.json(
        { error: 'ID de zona inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { materialId, quantidade = 1, precoUnitario, observacoes } = body

    // Validações básicas
    if (!materialId) {
      return NextResponse.json(
        { error: 'Material ID é obrigatório' },
        { status: 400 }
      )
    }

    if (quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Verificar se zona existe
    const zona = await prisma.zonaEspecifica.findUnique({
      where: { id: zonaId },
    })

    if (!zona) {
      return NextResponse.json(
        { error: 'Zona não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se material existe e está disponível
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material não encontrado' },
        { status: 404 }
      )
    }

    if (!material.disponivel) {
      return NextResponse.json(
        { error: 'Material não está disponível' },
        { status: 400 }
      )
    }

    // Verificar se material já está selecionado para esta zona
    const materialExistente = await prisma.materialSelecionado.findFirst({
      where: {
        zonaId,
        materialId,
      },
    })

    if (materialExistente) {
      return NextResponse.json(
        { error: 'Material já está selecionado para esta zona' },
        { status: 400 }
      )
    }

    // Criar seleção de material
    const materialSelecionado = await prisma.materialSelecionado.create({
      data: {
        zonaId,
        materialId,
        quantidade: parseFloat(quantidade.toString()),
        precoUnitario: precoUnitario ? parseFloat(precoUnitario.toString()) : material.precoUnitario,
        observacoes,
      },
      include: {
        material: {
          include: {
            tipoMaterial: {
              select: {
                nome: true,
                categoria: true,
                unidadeMedida: true,
              },
            },
            ficheiros: {
              orderBy: { criadoEm: 'desc' }
            },
          },
        },
      },
    })

    return NextResponse.json(materialSelecionado, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar material à zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 