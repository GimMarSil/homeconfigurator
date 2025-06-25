import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

// GET - Listar notificações do utilizador
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { searchParams } = new URL(request.url)
    const apenasNaoLidas = searchParams.get('apenasNaoLidas') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const tipo = searchParams.get('tipo')

    const where: any = {
      clienteId: user.clienteId,
      OR: [
        { destinatarioId: user.id }, // Notificações específicas para o utilizador
        { destinatarioId: null } // Notificações para todos do cliente
      ]
    }

    if (apenasNaoLidas) {
      where.lida = false
    }

    if (tipo) {
      where.tipo = tipo
    }

    const notificacoes = await prisma.notificacao.findMany({
      where,
      include: {
        remetente: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        criadoEm: 'desc'
      },
      take: limit
    })

    // Contar não lidas
    const naoLidas = await prisma.notificacao.count({
      where: {
        ...where,
        lida: false
      }
    })

    return NextResponse.json({
      notificacoes,
      totalNaoLidas: naoLidas
    })
    
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar nova notificação
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const body = await request.json()
    const {
      titulo,
      mensagem,
      tipo = 'SISTEMA',
      destinatarioIds, // Array de IDs de utilizadores ou null para todos
      edificioId,
      zonaId,
      url
    } = body

    if (!titulo || !mensagem) {
      return NextResponse.json({ error: 'Título e mensagem são obrigatórios' }, { status: 400 })
    }

    // Se destinatarioIds não for fornecido, criar notificação para todos do cliente
    if (!destinatarioIds || destinatarioIds.length === 0) {
      const novaNotificacao = await prisma.notificacao.create({
        data: {
          titulo,
          mensagem,
          tipo,
          clienteId: user.clienteId!,
          remetenteId: user.id,
          destinatarioId: null, // Para todos do cliente
          edificioId: edificioId ? parseInt(edificioId) : null,
          zonaId: zonaId ? parseInt(zonaId) : null,
          url
        },
        include: {
          remetente: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatar: true
            }
          }
        }
      })

      return NextResponse.json(novaNotificacao, { status: 201 })
    }

    // Criar notificações individuais
    const notificacoes = await Promise.all(
      destinatarioIds.map(async (destinatarioId: number) => {
        return prisma.notificacao.create({
          data: {
            titulo,
            mensagem,
            tipo,
            clienteId: user.clienteId!,
            remetenteId: user.id,
            destinatarioId,
            edificioId: edificioId ? parseInt(edificioId) : null,
            zonaId: zonaId ? parseInt(zonaId) : null,
            url
          },
          include: {
            remetente: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar: true
              }
            },
            destinatario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        })
      })
    )

    return NextResponse.json({
      message: `${notificacoes.length} notificações criadas`,
      notificacoes
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Marcar notificações como lidas
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const body = await request.json()
    const { notificacaoIds, marcarTodasLidas = false } = body

    if (marcarTodasLidas) {
      // Marcar todas as notificações do utilizador como lidas
      const resultado = await prisma.notificacao.updateMany({
        where: {
          clienteId: user.clienteId,
          OR: [
            { destinatarioId: user.id },
            { destinatarioId: null }
          ],
          lida: false
        },
        data: {
          lida: true,
          lidaEm: new Date()
        }
      })

      return NextResponse.json({
        message: `${resultado.count} notificações marcadas como lidas`
      })
    }

    if (!notificacaoIds || !Array.isArray(notificacaoIds)) {
      return NextResponse.json({ error: 'IDs de notificações inválidos' }, { status: 400 })
    }

    // Marcar notificações específicas como lidas
    const resultado = await prisma.notificacao.updateMany({
      where: {
        id: { in: notificacaoIds },
        clienteId: user.clienteId,
        OR: [
          { destinatarioId: user.id },
          { destinatarioId: null }
        ]
      },
      data: {
        lida: true,
        lidaEm: new Date()
      }
    })

    return NextResponse.json({
      message: `${resultado.count} notificações marcadas como lidas`
    })
    
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 