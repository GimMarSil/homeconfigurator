import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST - Aprovar ou rejeitar material personalizado
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    // Apenas admins podem aprovar materiais
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    const { id } = await params
    const materialId = parseInt(id)
    const body = await request.json()
    const { acao, motivoRejeicao } = body // 'APROVAR' ou 'REJEITAR'

    if (!['APROVAR', 'REJEITAR'].includes(acao)) {
      return NextResponse.json({ error: 'Ação deve ser APROVAR ou REJEITAR' }, { status: 400 })
    }

    // Verificar se o material existe e é personalizado
    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        isGlobal: false // Apenas materiais personalizados
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true
          }
        },
        tipoMaterial: true
      }
    })

    if (!material) {
      return NextResponse.json({ error: 'Material personalizado não encontrado' }, { status: 404 })
    }

    // Super admin pode aprovar qualquer material, admin normal apenas do seu cliente
    if (authResult.user.role === 'ADMIN' && material.clienteId !== authResult.user.clienteId) {
      return NextResponse.json({ error: 'Sem permissão para este material' }, { status: 403 })
    }

    if (acao === 'REJEITAR' && !motivoRejeicao) {
      return NextResponse.json({ error: 'Motivo da rejeição é obrigatório' }, { status: 400 })
    }

    // Atualizar material
    const materialAtualizado = await prisma.material.update({
      where: { id: materialId },
      data: {
        aprovado: acao === 'APROVAR',
        motivoRejeicao: acao === 'REJEITAR' ? motivoRejeicao : null
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true
          }
        },
        tipoMaterial: true
      }
    })

    // Criar notificação para o cliente
    await prisma.notificacao.create({
      data: {
        titulo: `Material ${acao === 'APROVAR' ? 'aprovado' : 'rejeitado'}`,
        mensagem: `O material "${material.nome}" foi ${acao === 'APROVAR' ? 'aprovado' : 'rejeitado'}${acao === 'REJEITAR' ? `: ${motivoRejeicao}` : ''}`,
        tipo: acao === 'APROVAR' ? 'APROVACAO' : 'REJEICAO',
        clienteId: material.clienteId!,
        remetenteId: authResult.user.id,
        url: `/dashboard/materiais/${materialId}`
      }
    })

    return NextResponse.json({
      message: `Material ${acao === 'APROVAR' ? 'aprovado' : 'rejeitado'} com sucesso`,
      material: materialAtualizado
    })
    
  } catch (error) {
    console.error('Erro ao processar aprovação de material:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 