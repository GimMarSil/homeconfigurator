import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { requireAuth } from '../../../../lib/auth-middleware'

// PUT /api/tipos-material/[id] - Atualizar tipo de material (apenas administradores)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }

  // Verificar se é administrador
  if (!['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem editar tipos de material.' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const tipoId = parseInt(id)
    const { nome, unidadeMedida, descricao } = await request.json()

    if (!nome || !unidadeMedida) {
      return NextResponse.json(
        { error: 'Nome e unidade de medida são obrigatórios' },
        { status: 400 }
      )
    }

    const tipoAtualizado = await prisma.tipoMaterial.update({
      where: { id: tipoId },
      data: {
        nome,
        unidadeMedida,
        descricao,
      },
    })

    return NextResponse.json(tipoAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar tipo de material:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/tipos-material/[id] - Eliminar tipo de material (apenas administradores)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }

  // Verificar se é administrador
  if (!['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem eliminar tipos de material.' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const tipoId = parseInt(id)

    // Verificar se existem materiais associados (proteção de integridade referencial)
    const materiaisAssociados = await prisma.material.count({
      where: { tipoMaterialId: tipoId }
    })

    if (materiaisAssociados > 0) {
      // Buscar exemplos dos materiais associados
      const exemplosMateriais = await prisma.material.findMany({
        where: { tipoMaterialId: tipoId },
        select: { nome: true, marca: true },
        take: 3
      })
      
      const exemplos = exemplosMateriais.map(m => `${m.nome}${m.marca ? ` (${m.marca})` : ''}`).join(', ')
      
      return NextResponse.json(
        { 
          error: `Não é possível eliminar este tipo de material.`,
          details: `Existem ${materiaisAssociados} materiais associados a este tipo.`,
          examples: `Exemplos: ${exemplos}${materiaisAssociados > 3 ? '...' : ''}`,
          constraint: 'REFERENTIAL_INTEGRITY'
        },
        { status: 409 } // Conflict
      )
    }

    await prisma.tipoMaterial.delete({
      where: { id: tipoId }
    })

    return NextResponse.json({ message: 'Tipo de material eliminado com sucesso' })
  } catch (error) {
    console.error('Erro ao eliminar tipo de material:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 