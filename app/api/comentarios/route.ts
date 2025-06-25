import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET - Listar comentários
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { searchParams } = new URL(request.url)
    const edificioId = searchParams.get('edificioId')
    const zonaId = searchParams.get('zonaId')
    const materialId = searchParams.get('materialId')
    const apenasNaoResolvidos = searchParams.get('apenasNaoResolvidos') === 'true'

    // Filtros baseados nos parâmetros
    const where: any = {
      clienteId: user.clienteId || undefined
    }

    if (edificioId) where.edificioId = parseInt(edificioId)
    if (zonaId) where.zonaId = parseInt(zonaId)
    if (materialId) where.materialId = parseInt(materialId)
    if (apenasNaoResolvidos) where.resolvido = false

    // Se não for admin, excluir comentários privados de outros
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      where.OR = [
        { privado: false },
        { utilizadorId: user.id }
      ]
    }

    const comentarios = await prisma.comentario.findMany({
      where,
      include: {
        utilizador: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
            role: true
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
        respostas: {
          include: {
            utilizador: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar: true,
                role: true
              }
            }
          },
          orderBy: {
            criadoEm: 'asc'
          }
        },
        ficheiros: true
      },
      orderBy: {
        criadoEm: 'desc'
      }
    })

    return NextResponse.json(comentarios)
    
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo comentário
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const body = await request.json()
    const {
      conteudo,
      tipo = 'GERAL',
      prioridade = 'NORMAL',
      privado = false,
      edificioId,
      zonaId,
      materialId,
      comentarioPaiId
    } = body

    if (!conteudo?.trim()) {
      return NextResponse.json({ error: 'Conteúdo é obrigatório' }, { status: 400 })
    }

    // Verificar se o utilizador tem acesso ao recurso
    if (edificioId) {
      const edificio = await prisma.edificio.findFirst({
        where: {
          id: edificioId,
          clienteId: user.clienteId || undefined
        }
      })
      if (!edificio && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Acesso negado ao edifício' }, { status: 403 })
      }
    }

    const novoComentario = await prisma.comentario.create({
      data: {
        conteudo: conteudo.trim(),
        tipo,
        prioridade,
        privado: privado && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'),
        utilizadorId: user.id,
        clienteId: user.clienteId!,
        edificioId: edificioId ? parseInt(edificioId) : null,
        zonaId: zonaId ? parseInt(zonaId) : null,
        materialId: materialId ? parseInt(materialId) : null,
        comentarioPaiId: comentarioPaiId ? parseInt(comentarioPaiId) : null
      },
      include: {
        utilizador: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true,
            role: true
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
        }
      }
    })

    // Criar notificação para outros utilizadores do cliente
    if (!comentarioPaiId) { // Apenas para comentários principais, não respostas
      await prisma.notificacao.create({
        data: {
          titulo: 'Novo comentário',
          mensagem: `${user.nome} adicionou um comentário${edificioId ? ` no edifício` : ''}`,
          tipo: 'COMENTARIO',
          clienteId: user.clienteId!,
          remetenteId: user.id,
          edificioId: edificioId ? parseInt(edificioId) : null,
          zonaId: zonaId ? parseInt(zonaId) : null,
          url: edificioId ? `/dashboard/edificios/${edificioId}` : undefined
        }
      })
    }

    return NextResponse.json(novoComentario, { status: 201 })
    
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 