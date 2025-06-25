import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { requireAuth } from '../../../../lib/auth-middleware'

interface BulkItem {
  id?: number
  nome: string
  descricao?: string
  isNew?: boolean
  isModified?: boolean
  isDeleted?: boolean
}

interface BulkResponse {
  created: number
  updated: number
  deleted: number
  errors: string[]
}

// POST /api/zonas-tipo/bulk - Operações em massa
export async function POST(request: NextRequest) {
  const user = await requireAuth(request)
  if (user instanceof NextResponse) {
    return user
  }

  // Verificar se é administrador
  if (!['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem fazer operações em massa.' },
      { status: 403 }
    )
  }

  try {
    const { items }: { items: BulkItem[] } = await request.json()
    
    const response: BulkResponse = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    }

    // Processar criações
    const itemsToCreate = items.filter(item => item.isNew && !item.isDeleted)
    for (const item of itemsToCreate) {
      try {
        if (!item.nome) {
          response.errors.push(`Item "${item.nome || 'sem nome'}": Nome é obrigatório`)
          continue
        }

        await prisma.zonaTipo.create({
          data: {
            nome: item.nome,
            descricao: item.descricao || null,
          }
        })
        response.created++
      } catch (error) {
        response.errors.push(`Erro ao criar "${item.nome}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    // Processar atualizações
    const itemsToUpdate = items.filter(item => item.isModified && !item.isDeleted && item.id)
    for (const item of itemsToUpdate) {
      try {
        if (!item.nome) {
          response.errors.push(`Item "${item.nome || 'sem nome'}": Nome é obrigatório`)
          continue
        }

        await prisma.zonaTipo.update({
          where: { id: item.id },
          data: {
            nome: item.nome,
            descricao: item.descricao || null,
          }
        })
        response.updated++
      } catch (error) {
        response.errors.push(`Erro ao atualizar "${item.nome}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    // Processar eliminações
    const itemsToDelete = items.filter(item => item.isDeleted && item.id)
    for (const item of itemsToDelete) {
      try {
        // Verificar se existem zonas associadas
        const zonasAssociadas = await prisma.zonaEspecifica.count({
          where: { zonaTipoId: item.id }
        })

        if (zonasAssociadas > 0) {
          response.errors.push(`Não é possível eliminar "${item.nome}": Existem ${zonasAssociadas} zonas associadas`)
          continue
        }

        await prisma.zonaTipo.delete({
          where: { id: item.id }
        })
        response.deleted++
      } catch (error) {
        response.errors.push(`Erro ao eliminar "${item.nome}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro em operação bulk:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 