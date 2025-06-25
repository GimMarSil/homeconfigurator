import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/material-selections - Listar seleções de materiais
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user // Erro de autenticação
    }

    const url = new URL(request.url)
    const clienteId = url.searchParams.get('clienteId')

    // Construir filtros baseados no utilizador
    let whereClause: any = {}

    if (user.role === 'super_admin' || user.role === 'admin') {
      // Super admin e admin podem ver tudo
      if (clienteId) {
        whereClause.zona = {
          edificio: {
            clienteId: parseInt(clienteId)
          }
        }
      }
    } else {
      // Utilizadores normais só veem as suas próprias seleções
      whereClause.zona = {
        edificio: {
          clienteId: user.clienteId
        }
      }
    }

    const selections = await prisma.selecaoMaterial.findMany({
      where: whereClause,
      include: {
        zona: {
          include: {
            edificio: {
              include: {
                cliente: {
                  select: {
                    id: true,
                    nome: true
                  }
                }
              }
            }
          }
        },
        material: {
          include: {
            tipoMaterial: {
              select: {
                nome: true,
                categoria: true,
                unidadeMedida: true
              }
            }
          }
        }
      },
      orderBy: {
        dataSelecao: 'desc'
      }
    })

    return NextResponse.json(selections)

  } catch (error) {
    console.error('Erro ao listar seleções:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/material-selections - Criar nova seleção
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user // Erro de autenticação
    }

    const body = await request.json()
    const { zonaId, materialId, quantidade, precoUnitario, observacoes } = body

    // Validações básicas
    if (!zonaId || !materialId || !quantidade || !precoUnitario) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: zonaId, materialId, quantidade, precoUnitario' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma seleção para esta zona/material
    const existingSelection = await prisma.selecaoMaterial.findUnique({
      where: {
        zonaId_materialId: {
          zonaId: parseInt(zonaId),
          materialId: parseInt(materialId)
        }
      }
    })

    if (existingSelection) {
      return NextResponse.json(
        { error: 'Já existe uma seleção deste material para esta zona' },
        { status: 400 }
      )
    }

    // Calcular preço total
    const precoTotal = quantidade * precoUnitario

    // Criar seleção
    const selection = await prisma.selecaoMaterial.create({
      data: {
        zonaId: parseInt(zonaId),
        materialId: parseInt(materialId),
        quantidade: parseFloat(quantidade),
        precoUnitario: parseFloat(precoUnitario),
        precoTotal,
        observacoes,
        estado: 'PENDENTE'
      },
      include: {
        zona: {
          include: {
            edificio: {
              include: {
                cliente: true
              }
            }
          }
        },
        material: {
          include: {
            tipoMaterial: true
          }
        }
      }
    })

    return NextResponse.json(selection, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar seleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 