import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET - Buscar comentário específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { id: paramId } = await params
    const id = parseInt(paramId)

    const comentario = await prisma.comentario.findFirst({
      where: {
        id,
        clienteId: user.clienteId // Filtrar por cliente
      },
      include: {
        utilizador: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true
          }
        },
        edificio: {
          select: {
            id: true,
            nome: true
          }
        },
        zona: {
          select: {
            id: true,
            nome: true
          }
        },
        material: {
          select: {
            id: true,
            nome: true
          }
        },
        ficheiros: true
      }
    })

    if (!comentario) {
      return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(comentario)
    
  } catch (error) {
    console.error('Erro ao buscar comentário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar comentário
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { id: paramId } = await params
    const id = parseInt(paramId)
    const body = await request.json()
    const { conteudo } = body

    if (!conteudo) {
      return NextResponse.json({ error: 'Conteúdo é obrigatório' }, { status: 400 })
    }

    // Verificar se o comentário existe e se o utilizador tem permissão
    const comentario = await prisma.comentario.findFirst({
      where: {
        id,
        OR: [
          { utilizadorId: user.id }, // Autor pode editar
          { 
            AND: [
              { clienteId: user.clienteId },
              { 
                OR: [
                  { utilizador: { role: 'admin' } },
                  { utilizador: { role: 'super_admin' } }
                ]
              }
            ]
          } // Admin pode editar comentários do cliente
        ]
      }
    })

    if (!comentario) {
      return NextResponse.json({ error: 'Comentário não encontrado ou sem permissão' }, { status: 404 })
    }

    const comentarioAtualizado = await prisma.comentario.update({
      where: { id },
      data: { conteudo },
      include: {
        utilizador: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(comentarioAtualizado)
    
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar comentário
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { id: paramId } = await params
    const id = parseInt(paramId)

    // Verificar se o comentário existe e permissões
    const comentario = await prisma.comentario.findFirst({
      where: {
        id,
        OR: [
          { utilizadorId: user.id }, // Autor pode eliminar
          { 
            AND: [
              { clienteId: user.clienteId },
              { 
                OR: [
                  { utilizador: { role: 'admin' } },
                  { utilizador: { role: 'super_admin' } }
                ]
              }
            ]
          } // Admin pode eliminar comentários do cliente
        ]
      }
    })

    if (!comentario) {
      return NextResponse.json({ error: 'Comentário não encontrado ou sem permissão' }, { status: 404 })
    }

    await prisma.comentario.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Comentário eliminado com sucesso' })
    
  } catch (error) {
    console.error('Erro ao eliminar comentário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 