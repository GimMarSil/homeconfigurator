import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { requireSuperAdmin } from '../../../lib/auth-middleware'
import bcrypt from 'bcryptjs'

// GET /api/utilizadores - Listar todos os utilizadores
export async function GET(request: NextRequest) {
  try {
    // Para agora, vamos permitir acesso para qualquer utilizador autenticado
    // Em produção, adicionar verificação de autenticação adequada
    
    const utilizadores = await prisma.utilizador.findMany({
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
      orderBy: {
        nome: 'asc',
      },
    })

    return NextResponse.json(utilizadores)
  } catch (error) {
    console.error('Erro ao buscar utilizadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/utilizadores - Criar novo utilizador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, telefone, password, role, status, clienteId } = body

    // Validações básicas
    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e password são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const utilizadorExistente = await prisma.utilizador.findUnique({
      where: { email },
    })

    if (utilizadorExistente) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Verificar se cliente existe (se fornecido)
    if (clienteId) {
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

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10)

    const novoUtilizador = await prisma.utilizador.create({
      data: {
        nome,
        email,
        telefone: telefone || null,
        password: hashedPassword,
        role: role || 'VISUALIZADOR',
        status: status || 'ATIVO',
        clienteId: clienteId ? parseInt(clienteId) : null,
      },
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

    return NextResponse.json(novoUtilizador, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar utilizador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 