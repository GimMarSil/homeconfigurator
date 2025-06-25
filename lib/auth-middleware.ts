import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import { AuthDebugger } from './auth-debug'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number
    name: string
    email: string
    role: string
    clienteId?: number
    clienteNome?: string
  }
}

// Verificar autenticação através do token na sessão
export async function verifyAuth(request: NextRequest): Promise<{
  isAuthenticated: boolean
  user?: any
  error?: string
}> {
  try {
    // Procurar por header de autorização ou cookie de sessão
    const authHeader = request.headers.get('authorization')
    const userCookie = request.cookies.get('user')?.value

    let userData = null

    console.log('Auth verification - Headers:', {
      authHeader: authHeader ? 'Bearer token present' : 'No auth header',
      userCookie: userCookie ? 'Cookie present' : 'No cookie',
      method: request.method,
      url: request.url
    })

    let authMethod: 'bearer' | 'cookie' | 'none' = 'none'
    let tokenPresent = false

    // Se há authorization header (para APIs)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authMethod = 'bearer'
      tokenPresent = true
      const token = authHeader.substring(7)
      // Para simplificar, assumimos que o token é o JSON do utilizador (em produção seria JWT)
      try {
        userData = JSON.parse(decodeURIComponent(token))
        console.log('Parsed user data from Bearer token:', { 
          id: userData?.id, 
          email: userData?.email, 
          role: userData?.role 
        })
        
        AuthDebugger.log({
          user: { id: userData?.id, email: userData?.email, role: userData?.role },
          authMethod: 'bearer',
          tokenPresent: true,
          tokenValid: !!(userData?.id !== undefined && userData?.id !== null && userData?.email),
        })
      } catch (parseError) {
        console.error('Erro ao fazer parse do token Bearer:', parseError)
        AuthDebugger.log({
          authMethod: 'bearer',
          tokenPresent: true,
          tokenValid: false,
          errorMessage: 'Token inválido - formato incorreto'
        })
        return { isAuthenticated: false, error: 'Token inválido - formato incorreto' }
      }
    }
    // Se há cookie de utilizador (para páginas web)
    else if (userCookie) {
      authMethod = 'cookie'
      tokenPresent = true
      try {
        userData = JSON.parse(decodeURIComponent(userCookie))
        console.log('Parsed user data from cookie:', { 
          id: userData?.id, 
          email: userData?.email, 
          role: userData?.role 
        })
        
        AuthDebugger.log({
          user: { id: userData?.id, email: userData?.email, role: userData?.role },
          authMethod: 'cookie',
          tokenPresent: true,
          tokenValid: !!(userData?.id !== undefined && userData?.id !== null && userData?.email),
        })
      } catch (parseError) {
        console.error('Erro ao fazer parse do cookie:', parseError)
        AuthDebugger.log({
          authMethod: 'cookie',
          tokenPresent: true,
          tokenValid: false,
          errorMessage: 'Sessão inválida - cookie corrompido'
        })
        return { isAuthenticated: false, error: 'Sessão inválida - cookie corrompido' }
      }
    }
    // Verificar se há dados de utilizador no localStorage (simulação)
    else {
      console.log('No authentication method found')
      AuthDebugger.log({
        authMethod: 'none',
        tokenPresent: false,
        tokenValid: false,
        errorMessage: 'Sem autenticação - nenhum token ou cookie encontrado'
      })
      return { isAuthenticated: false, error: 'Sem autenticação - nenhum token ou cookie encontrado' }
    }

    if (!userData || userData.id === undefined || userData.id === null || !userData.email) {
      console.error('User data validation failed:', userData)
      return { isAuthenticated: false, error: 'Dados de utilizador inválidos - campos obrigatórios em falta' }
    }

    // Verificar se é super admin
    if (userData.role === 'super_admin') {
      console.log('Super admin authenticated successfully')
      return { isAuthenticated: true, user: userData }
    }

    // Para utilizadores normais, verificar se existem na base de dados
    console.log('Verifying normal user in database:', userData.id)
    const utilizador = await prisma.utilizador.findUnique({
      where: { 
        id: userData.id,
        status: 'ATIVO'
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            status: true
          }
        }
      }
    })

    if (!utilizador) {
      console.error('User not found or inactive in database:', userData.id)
      return { isAuthenticated: false, error: 'Utilizador não encontrado ou inativo' }
    }

    if (utilizador.cliente.status !== 'ATIVO') {
      console.error('User client is inactive:', { userId: userData.id, clientId: utilizador.clienteId })
      return { isAuthenticated: false, error: 'Cliente inativo' }
    }

    console.log('Normal user authenticated successfully:', { 
      userId: utilizador.id, 
      clientId: utilizador.clienteId 
    })

    return { 
      isAuthenticated: true, 
      user: {
        id: utilizador.id,
        name: utilizador.nome,
        email: utilizador.email,
        role: utilizador.role.toLowerCase(),
        clienteId: utilizador.clienteId,
        clienteNome: utilizador.cliente.nome
      }
    }
  } catch (error) {
    console.error('Erro na verificação de autenticação:', error)
    return { isAuthenticated: false, error: 'Erro interno de autenticação' }
  }
}

// Middleware para proteger rotas que requerem autenticação
export async function requireAuth(request: NextRequest) {
  const auth = await verifyAuth(request)
  
  if (!auth.isAuthenticated) {
    console.log('Authentication failed:', auth.error)
    return NextResponse.json(
      { error: auth.error || 'Acesso negado' },
      { status: 401 }
    )
  }

  console.log('Authentication successful for user:', auth.user?.email)
  return auth.user
}

// Middleware para proteger rotas que requerem super admin
export async function requireSuperAdmin(request: NextRequest) {
  const user = await requireAuth(request)
  
  if (user instanceof NextResponse) {
    return user // Erro de autenticação
  }

  if (user.role !== 'super_admin') {
    console.log('Super admin access denied for user:', user.email, 'Role:', user.role)
    return NextResponse.json(
      { error: 'Acesso restrito a super administradores' },
      { status: 403 }
    )
  }

  console.log('Super admin access granted for user:', user.email)
  return user
}

// Middleware para proteger rotas onde utilizador só pode aceder aos seus dados
export async function requireClientAccess(request: NextRequest, clienteId?: number) {
  const user = await requireAuth(request)
  
  if (user instanceof NextResponse) {
    return user // Erro de autenticação
  }

  // Super admin pode aceder a tudo
  if (user.role === 'super_admin') {
    console.log('Super admin client access granted')
    return user
  }

  // Verificar se o utilizador tem acesso ao cliente
  if (clienteId && user.clienteId !== clienteId) {
    console.log('Client access denied:', { 
      userClientId: user.clienteId, 
      requestedClientId: clienteId 
    })
    return NextResponse.json(
      { error: 'Acesso negado aos dados deste cliente' },
      { status: 403 }
    )
  }

  console.log('Client access granted for user:', user.email)
  return user
}

// Função authMiddleware para compatibilidade com as APIs
export async function authMiddleware(request: NextRequest) {
  const auth = await verifyAuth(request)
  
  if (!auth.isAuthenticated) {
    return {
      success: false,
      error: auth.error || 'Acesso negado'
    }
  }

  return {
    success: true,
    user: auth.user
  }
} 