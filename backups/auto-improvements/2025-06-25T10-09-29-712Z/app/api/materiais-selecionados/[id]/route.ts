import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// PUT /api/materiais-selecionados/[id] - Atualizar material selecionado
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { quantidade, precoUnitario, observacoes } = body

    // Validações básicas
    if (quantidade !== undefined && quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      )
    }

    if (precoUnitario !== undefined && precoUnitario < 0) {
      return NextResponse.json(
        { error: 'Preço unitário não pode ser negativo' },
        { status: 400 }
      )
    }

    // Verificar se material selecionado existe
    const materialExistente = await prisma.materialSelecionado.findUnique({
      where: { id },
    })

    if (!materialExistente) {
      return NextResponse.json(
        { error: 'Material selecionado não encontrado' },
        { status: 404 }
      )
    }

    const materialAtualizado = await prisma.materialSelecionado.update({
      where: { id },
      data: {
        ...(quantidade !== undefined && { quantidade: parseFloat(quantidade.toString()) }),
        ...(precoUnitario !== undefined && { precoUnitario: parseFloat(precoUnitario.toString()) }),
        ...(observacoes !== undefined && { observacoes }),
        atualizadoEm: new Date(),
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
          },
        },
        zona: {
          select: {
            id: true,
            nome: true,
            area: true,
          },
        },
      },
    })

    return NextResponse.json(materialAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar material selecionado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/materiais-selecionados/[id] - Remover material selecionado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar se material selecionado existe
    const material = await prisma.materialSelecionado.findUnique({
      where: { id },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material selecionado não encontrado' },
        { status: 404 }
      )
    }

    await prisma.materialSelecionado.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Material removido da zona com sucesso' })
  } catch (error) {
    console.error('Erro ao remover material selecionado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 