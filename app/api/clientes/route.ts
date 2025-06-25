import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { requireSuperAdmin } from '../../../lib/auth-middleware'

// GET /api/clientes - Listar todos os clientes (só super admin)
export async function GET(request: NextRequest) {
  // Verificar se é super admin
  const user = await requireSuperAdmin(request)
  if (user instanceof NextResponse) {
    return user // Retorna erro de autorização
  }

  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        utilizadores: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            status: true,
            ultimoAcesso: true,
          },
        },
        edificios: {
          select: {
            id: true,
            nome: true,
            estado: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/clientes - Criar novo cliente (só super admin)
export async function POST(request: NextRequest) {
  // Verificar se é super admin
  const user = await requireSuperAdmin(request)
  if (user instanceof NextResponse) {
    return user // Retorna erro de autorização
  }

  try {
    const body = await request.json()
    const { nome, email, telefone, morada, nif, status } = body

    // Validações básicas
    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { email },
    })

    if (clienteExistente) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone: telefone || null,
        morada: morada || null,
        nif: nif || null,
        status: status || 'ATIVO',
      },
      include: {
        utilizadores: true,
        edificios: true,
      },
    })

    return NextResponse.json(novoCliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 