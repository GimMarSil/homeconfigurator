import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// POST /api/material-selections/[id]/reject - Rejeitar seleção
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user // Erro de autenticação
    }

    // Verificar se o utilizador tem permissão para rejeitar
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para rejeitar seleções' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const selectionId = parseInt(resolvedParams.id)

    if (isNaN(selectionId)) {
      return NextResponse.json(
        { error: 'ID de seleção inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { motivoRejeicao, aprovadoPor } = body

    // Validar motivo de rejeição
    if (!motivoRejeicao || motivoRejeicao.trim().length === 0) {
      return NextResponse.json(
        { error: 'Motivo de rejeição é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a seleção existe
    const selection = await prisma.selecaoMaterial.findUnique({
      where: { id: selectionId }
    })

    if (!selection) {
      return NextResponse.json(
        { error: 'Seleção não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a seleção está pendente
    if (selection.estado !== 'PENDENTE') {
      return NextResponse.json(
        { error: 'Apenas seleções pendentes podem ser rejeitadas' },
        { status: 400 }
      )
    }

    // Rejeitar seleção
    const updatedSelection = await prisma.selecaoMaterial.update({
      where: { id: selectionId },
      data: {
        estado: 'REJEITADO',
        dataAprovacao: new Date(),
        aprovadoPor: aprovadoPor || user.email,
        motivoRejeicao: motivoRejeicao.trim()
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

    return NextResponse.json(updatedSelection)

  } catch (error) {
    console.error('Erro ao rejeitar seleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 