import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET /api/clientes/[id] - Buscar cliente específico
export async function GET(
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

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        utilizadores: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            role: true,
            status: true,
            ultimoAcesso: true,
          },
        },
        edificios: {
          select: {
            id: true,
            nome: true,
            morada: true,
            tipologia: true,
            estado: true,
            areaBruta: true,
          },
        },
      },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/clientes/[id] - Atualizar cliente
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
    const { nome, email, telefone, morada, nif, status } = body

    // Verificar se cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    })

    if (!clienteExistente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se email já está em uso por outro cliente
    if (email && email !== clienteExistente.email) {
      const emailEmUso = await prisma.cliente.findUnique({
        where: { email },
      })

      if (emailEmUso) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        )
      }
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(email && { email }),
        ...(telefone !== undefined && { telefone: telefone || null }),
        ...(morada !== undefined && { morada: morada || null }),
        ...(nif !== undefined && { nif: nif || null }),
        ...(status && { status }),
      },
      include: {
        utilizadores: true,
        edificios: true,
      },
    })

    return NextResponse.json(clienteAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/clientes/[id] - Eliminar cliente
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

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        utilizadores: {
          select: { id: true, nome: true, email: true, role: true }
        },
        edificios: {
          select: { 
            id: true, 
            nome: true,
            zonasEspecificas: { select: { id: true } }
          }
        },
        materiais: { select: { id: true } },
        notificacoes: { select: { id: true } },
        comentarios: { select: { id: true } }
      },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se cliente tem dependências (proteção de integridade referencial)
    const problems = []
    
    if (cliente.utilizadores.length > 0) {
      const admins = cliente.utilizadores.filter(u => ['admin', 'super_admin'].includes(u.role))
      const exemplosUsers = cliente.utilizadores.slice(0, 3).map(u => `${u.nome} (${u.email})`).join(', ')
      
      problems.push(`${cliente.utilizadores.length} utilizadores associados (${admins.length} administradores)`)
      problems.push(`Exemplos: ${exemplosUsers}${cliente.utilizadores.length > 3 ? '...' : ''}`)
    }

    if (cliente.edificios.length > 0) {
      const edificiosComZonas = cliente.edificios.filter(e => e.zonasEspecificas.length > 0)
      const exemplosEdificios = cliente.edificios.slice(0, 3).map(e => e.nome).join(', ')
      
      problems.push(`${cliente.edificios.length} edifícios associados (${edificiosComZonas.length} com zonas)`)
      problems.push(`Exemplos de edifícios: ${exemplosEdificios}${cliente.edificios.length > 3 ? '...' : ''}`)
    }

    if (cliente.materiais.length > 0) {
      problems.push(`${cliente.materiais.length} materiais personalizados`)
    }

    if (cliente.notificacoes.length > 0) {
      problems.push(`${cliente.notificacoes.length} notificações`)
    }

    if (cliente.comentarios.length > 0) {
      problems.push(`${cliente.comentarios.length} comentários`)
    }

    if (problems.length > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível eliminar este cliente.`,
          details: problems.join('. '),
          suggestion: 'Remova primeiro todos os utilizadores, edifícios, materiais e outros dados associados.',
          constraint: 'REFERENTIAL_INTEGRITY'
        },
        { status: 409 } // Conflict
      )
    }

    await prisma.cliente.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cliente eliminado com sucesso' })
  } catch (error) {
    console.error('Erro ao eliminar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 