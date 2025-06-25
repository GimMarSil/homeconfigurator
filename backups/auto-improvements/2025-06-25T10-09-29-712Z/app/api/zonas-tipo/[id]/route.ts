import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { requireAuth } from '../../../../lib/auth-middleware'

// PUT /api/zonas-tipo/[id] - Atualizar tipo de zona (apenas administradores)
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
      { error: 'Acesso negado. Apenas administradores podem editar tipos de zona.' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const tipoId = parseInt(id)
    const { nome, descricao } = await request.json()

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    const tipoAtualizado = await prisma.zonaTipo.update({
      where: { id: tipoId },
      data: {
        nome,
        descricao,
      },
    })

    return NextResponse.json(tipoAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar tipo de zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/zonas-tipo/[id] - Eliminar tipo de zona (apenas administradores)
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
      { error: 'Acesso negado. Apenas administradores podem eliminar tipos de zona.' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const tipoId = parseInt(id)

    // Verificar se existem zonas associadas (proteção de integridade referencial)
    const zonasAssociadas = await prisma.zonaEspecifica.count({
      where: { zonaTipoId: tipoId }
    })

    if (zonasAssociadas > 0) {
      // Buscar exemplos das zonas associadas
      const exemplosZonas = await prisma.zonaEspecifica.findMany({
        where: { zonaTipoId: tipoId },
        select: { nome: true, edificio: { select: { nome: true } } },
        take: 3
      })
      
      const exemplos = exemplosZonas.map(z => `${z.nome} (${z.edificio?.nome})`).join(', ')
      
      return NextResponse.json(
        { 
          error: `Não é possível eliminar este tipo de zona.`,
          details: `Existem ${zonasAssociadas} zonas associadas a este tipo.`,
          examples: `Exemplos: ${exemplos}${zonasAssociadas > 3 ? '...' : ''}`,
          constraint: 'REFERENTIAL_INTEGRITY'
        },
        { status: 409 } // Conflict
      )
    }

    await prisma.zonaTipo.delete({
      where: { id: tipoId }
    })

    return NextResponse.json({ message: 'Tipo de zona eliminado com sucesso' })
  } catch (error) {
    console.error('Erro ao eliminar tipo de zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 