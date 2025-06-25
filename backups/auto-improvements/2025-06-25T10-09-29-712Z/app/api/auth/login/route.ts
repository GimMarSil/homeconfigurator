import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/auth/login - Fazer login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e palavra-passe são obrigatórios' },
        { status: 400 }
      )
    }

    // Super admin
    if (email === 'admin@homeconfigurator.pt' && password === 'admin123') {
      const userData = {
        id: 0,
        name: 'Super Administrador',
        email: 'admin@homeconfigurator.pt',
        role: 'super_admin' as const,
      }

      return NextResponse.json({ user: userData, success: true })
    }

    // Buscar utilizador na base de dados
    const utilizador = await prisma.utilizador.findUnique({
      where: { 
        email,
        status: 'ATIVO',
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            status: true,
          },
        },
      },
    })

    if (!utilizador) {
      return NextResponse.json(
        { error: 'Email ou palavra-passe incorretos' },
        { status: 401 }
      )
    }

    // Verificar se o cliente está ativo
    if (utilizador.cliente.status !== 'ATIVO') {
      return NextResponse.json(
        { error: 'Cliente inativo' },
        { status: 401 }
      )
    }

    // Verificar palavra-passe (temporariamente sem hash)
    // TODO: Implementar bcrypt nas palavras-passe
    if (utilizador.password !== password) {
      return NextResponse.json(
        { error: 'Email ou palavra-passe incorretos' },
        { status: 401 }
      )
    }

    // Atualizar último acesso
    await prisma.utilizador.update({
      where: { id: utilizador.id },
      data: { ultimoAcesso: new Date() },
    })

    const userData = {
      id: utilizador.id,
      name: utilizador.nome,
      email: utilizador.email,
      role: utilizador.role.toLowerCase(),
      clienteId: utilizador.clienteId,
      clienteNome: utilizador.cliente.nome,
    }

    return NextResponse.json({ user: userData, success: true })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 