import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/utilizadores/[id] - Buscar utilizador específico
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

    const utilizador = await prisma.utilizador.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
        status: true,
        ultimoAcesso: true,
        clienteId: true,
        criadoEm: true,
        atualizadoEm: true,
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    })

    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(utilizador)
  } catch (error) {
    console.error('Erro ao buscar utilizador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/utilizadores/[id] - Atualizar utilizador
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
    const { nome, email, telefone, password, role, status, clienteId } = body

    // Verificar se utilizador existe
    const utilizadorExistente = await prisma.utilizador.findUnique({
      where: { id },
    })

    if (!utilizadorExistente) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se email já está em uso por outro utilizador
    if (email && email !== utilizadorExistente.email) {
      const emailEmUso = await prisma.utilizador.findUnique({
        where: { email },
      })

      if (emailEmUso) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        )
      }
    }

    // Verificar se cliente existe (se fornecido)
    if (clienteId && clienteId !== utilizadorExistente.clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(clienteId) },
      })

      if (!cliente) {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    if (nome) updateData.nome = nome
    if (email) updateData.email = email
    if (telefone !== undefined) updateData.telefone = telefone || null
    if (role) updateData.role = role
    if (status) updateData.status = status
    if (clienteId !== undefined) updateData.clienteId = clienteId ? parseInt(clienteId) : null
    
    // Hash da nova password se fornecida
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const utilizadorAtualizado = await prisma.utilizador.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
        status: true,
        ultimoAcesso: true,
        clienteId: true,
        criadoEm: true,
        atualizadoEm: true,
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(utilizadorAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/utilizadores/[id] - Eliminar utilizador
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

    // Verificar se utilizador existe
    const utilizador = await prisma.utilizador.findUnique({
      where: { id },
      include: {
        comentarios: { select: { id: true } },
        notificacoesEnviadas: { select: { id: true } },
        notificacoesRecebidas: { select: { id: true } },
        cliente: { 
          select: { 
            nome: true,
            utilizadores: { 
              select: { id: true, role: true } 
            } 
          } 
        }
      },
    })

    if (!utilizador) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se é o último administrador do cliente
    if (['admin', 'super_admin'].includes(utilizador.role) && utilizador.clienteId) {
      const outrosAdmins = utilizador.cliente?.utilizadores.filter(u => 
        u.id !== utilizador.id && ['admin', 'super_admin'].includes(u.role)
      ) || []

      if (outrosAdmins.length === 0) {
        return NextResponse.json(
          { 
            error: `Não é possível eliminar o último administrador do cliente.`,
            details: `Este utilizador é o único administrador do cliente "${utilizador.cliente?.nome}".`,
            suggestion: 'Promova outro utilizador a administrador antes de eliminar este.',
            constraint: 'BUSINESS_RULE'
          },
          { status: 409 } // Conflict
        )
      }
    }

    // Verificar dependências (proteção de integridade referencial)
    const problems = []
    
    if (utilizador.comentarios.length > 0) {
      problems.push(`${utilizador.comentarios.length} comentários criados`)
    }

    if (utilizador.notificacoesEnviadas.length > 0) {
      problems.push(`${utilizador.notificacoesEnviadas.length} notificações enviadas`)
    }

    if (utilizador.notificacoesRecebidas.length > 0) {
      problems.push(`${utilizador.notificacoesRecebidas.length} notificações recebidas`)
    }

    if (problems.length > 0) {
      return NextResponse.json(
        { 
          error: `Utilizador "${utilizador.nome}" tem dados associados.`,
          details: problems.join('. '),
          suggestion: 'Os dados do utilizador serão mantidos para histórico, mas a conta será desativada.',
          constraint: 'REFERENTIAL_INTEGRITY'
        },
        { status: 409 } // Conflict
      )
    }

    await prisma.utilizador.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Utilizador eliminado com sucesso' })
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 