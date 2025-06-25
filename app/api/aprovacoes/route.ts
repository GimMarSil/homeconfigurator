import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET - Listar materiais pendentes de aprovação
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    // Apenas admins podem ver aprovações
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'PENDENTE', 'APROVADO', 'REJEITADO'
    const limite = parseInt(searchParams.get('limite') || '50')

    const where: any = {
      isGlobal: false // Apenas materiais personalizados
    }

    // Super admin vê todos, admin normal apenas do seu cliente
    if (user.role === 'admin') {
      where.clienteId = user.clienteId
    }

    // Filtrar por status de aprovação
    if (status === 'PENDENTE') {
      where.aprovado = null
    } else if (status === 'APROVADO') {
      where.aprovado = true
    } else if (status === 'REJEITADO') {
      where.aprovado = false
    }

    const materiais = await prisma.material.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true
          }
        },
        tipoMaterial: {
          select: {
            id: true,
            nome: true
          }
        },
        ficheiros: {
          where: {
            categoria: 'IMAGEM_MATERIAL'
          },
          take: 1
        }
      },
      orderBy: {
        criadoEm: 'desc'
      },
      take: limite
    })

    // Contar totais por status
    const [pendentes, aprovados, rejeitados] = await Promise.all([
      prisma.material.count({
        where: {
          ...where,
          aprovado: null
        }
      }),
      prisma.material.count({
        where: {
          ...where,
          aprovado: true
        }
      }),
      prisma.material.count({
        where: {
          ...where,
          aprovado: false
        }
      })
    ])

    return NextResponse.json({
      materiais,
      totais: {
        pendentes,
        aprovados,
        rejeitados
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar aprovações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Processar aprovação/rejeição em massa
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    // Apenas admins podem aprovar materiais
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    const body = await request.json()
    const { materialIds, acao, motivoRejeicao } = body // 'APROVAR' ou 'REJEITAR'

    if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return NextResponse.json({ error: 'IDs de materiais são obrigatórios' }, { status: 400 })
    }

    if (!['APROVAR', 'REJEITAR'].includes(acao)) {
      return NextResponse.json({ error: 'Ação deve ser APROVAR ou REJEITAR' }, { status: 400 })
    }

    if (acao === 'REJEITAR' && !motivoRejeicao) {
      return NextResponse.json({ error: 'Motivo da rejeição é obrigatório' }, { status: 400 })
    }

    // Buscar materiais válidos
    const where: any = {
      id: { in: materialIds.map(id => parseInt(id)) },
      isGlobal: false,
      aprovado: null // Apenas pendentes
    }

    // Admin normal apenas do seu cliente
    if (user.role === 'admin') {
      where.clienteId = user.clienteId
    }

    const materiais = await prisma.material.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    if (materiais.length === 0) {
      return NextResponse.json({ error: 'Nenhum material válido encontrado' }, { status: 404 })
    }

    // Atualizar materiais
    await prisma.material.updateMany({
      where: {
        id: { in: materiais.map(m => m.id) }
      },
      data: {
        aprovado: acao === 'APROVAR',
        motivoRejeicao: acao === 'REJEITAR' ? motivoRejeicao : null
      }
    })

    // Criar notificações para os clientes
    const notificacoesPorCliente = new Map()
    
    materiais.forEach(material => {
      const clienteId = material.clienteId!
      if (!notificacoesPorCliente.has(clienteId)) {
        notificacoesPorCliente.set(clienteId, [])
      }
      notificacoesPorCliente.get(clienteId).push(material.nome)
    })

    await Promise.all(
      Array.from(notificacoesPorCliente.entries()).map(async ([clienteId, nomes]) => {
        const nomesStr = nomes.length > 3 ? 
          `${nomes.slice(0, 3).join(', ')} e mais ${nomes.length - 3}` : 
          nomes.join(', ')

        return prisma.notificacao.create({
          data: {
            titulo: `Materiais ${acao === 'APROVAR' ? 'aprovados' : 'rejeitados'}`,
            mensagem: `${nomes.length} material(is) foi(ram) ${acao === 'APROVAR' ? 'aprovado(s)' : 'rejeitado(s)'}: ${nomesStr}${acao === 'REJEITAR' ? `. Motivo: ${motivoRejeicao}` : ''}`,
            tipo: acao === 'APROVAR' ? 'APROVACAO' : 'REJEICAO',
            clienteId: parseInt(clienteId),
            remetenteId: user.id,
            url: '/dashboard/materiais'
          }
        })
      })
    )

    return NextResponse.json({
      message: `${materiais.length} material(is) ${acao === 'APROVAR' ? 'aprovado(s)' : 'rejeitado(s)'} com sucesso`,
      processados: materiais.length
    })
    
  } catch (error) {
    console.error('Erro ao processar aprovações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 